/* ========================================================================
   Dyer Automotive Fixed Operations Training
   Shared auth + Supabase client for all training pages.
   Reads the dyer_session from fixedstats and exposes currentUser + helpers.
   ======================================================================== */

(function () {
  "use strict";

  // ---- Supabase config (matches fixedstats main app) ---------------------
  const SUPABASE_URL = "https://eflnjrorpgrqbvzljewu.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbG5qcm9ycGdycWJ2emxqZXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1Njg5ODMsImV4cCI6MjA5MTE0NDk4M30.4qVg6A4kynixs-Dm-Et1geJ56jqymekdnI0LexbIr_g";

  // Wait for the supabase global to be present
  if (!window.supabase || !window.supabase.createClient) {
    console.error(
      "[training-auth] Supabase client not loaded. Make sure the supabase-js script tag is included before training-auth.js."
    );
    return;
  }

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ---- Session lookup ----------------------------------------------------
  let currentUser = null;
  try {
    const sessionJson = sessionStorage.getItem("dyer_session");
    if (sessionJson) {
      currentUser = JSON.parse(sessionJson);
    }
  } catch (_) {
    /* fall through to redirect */
  }

  // If no session — redirect to fixedstats main app for login
  if (!currentUser || !currentUser.id) {
    // Don't redirect during local file:// previews — just warn
    if (location.protocol === "file:") {
      console.warn(
        "[training-auth] No dyer_session found. In production this would redirect to / for login."
      );
    } else {
      // Preserve where they were going so we can come back after login
      const returnTo = encodeURIComponent(location.pathname + location.search);
      location.replace("/?returnTo=" + returnTo);
      return;
    }
  }

  // ---- Identity strip ----------------------------------------------------
  // Renders a small "Logged in as ..." strip below the site header.
  function renderIdentityStrip() {
    if (!currentUser) return;

    // Skip if already rendered
    if (document.querySelector(".training-identity-strip")) return;

    const roleLabels = {
      admin: "Admin",
      executive: "Executive",
      manager: "Service Manager",
      parts_manager: "Parts Manager",
      collision_manager: "Collision Manager",
      advisor: "Service Advisor",
      technician: "Technician",
      user: "Team Member"
    };

    const name = currentUser.display_name || currentUser.username || "User";
    const role = roleLabels[currentUser.role] || currentUser.role || "User";
    const store = currentUser.default_store
      ? " · " + currentUser.default_store
      : "";

    const strip = document.createElement("div");
    strip.className = "training-identity-strip";
    strip.innerHTML =
      '<div class="tis-inner">' +
      '<span class="tis-label">Signed in</span>' +
      '<span class="tis-name">' + escapeHtml(name) + '</span>' +
      '<span class="tis-meta">' + escapeHtml(role) + escapeHtml(store) + '</span>' +
      '<a href="/training/my-training.html" class="tis-link">My Training →</a>' +
      '<a href="/" class="tis-link tis-link-out">← fixedstats</a>' +
      '</div>';

    // Insert after .progress-wrap if present, else after .site-header
    const progress = document.querySelector(".progress-wrap");
    const header = document.querySelector(".site-header");
    const anchor = progress || header;
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(strip, anchor.nextSibling);
    } else {
      document.body.insertBefore(strip, document.body.firstChild);
    }

    injectIdentityStyles();
  }

  function injectIdentityStyles() {
    if (document.getElementById("training-identity-styles")) return;
    const style = document.createElement("style");
    style.id = "training-identity-styles";
    style.textContent = [
      ".training-identity-strip{",
      "  background:#1a1a1a;",
      "  border-bottom:1px solid #333;",
      "  color:#fff;",
      "  font-size:13px;",
      "}",
      ".training-identity-strip .tis-inner{",
      "  max-width:1100px;margin:0 auto;padding:10px 24px;",
      "  display:flex;align-items:center;gap:14px;flex-wrap:wrap;",
      "}",
      ".training-identity-strip .tis-label{",
      "  text-transform:uppercase;letter-spacing:0.6px;font-size:10px;",
      "  font-weight:700;color:#888;",
      "}",
      ".training-identity-strip .tis-name{",
      "  font-weight:700;color:#fff;",
      "}",
      ".training-identity-strip .tis-meta{",
      "  color:#cccccc;",
      "}",
      ".training-identity-strip .tis-link{",
      "  margin-left:auto;color:#cccccc;text-decoration:none;",
      "  font-size:12px;font-weight:600;",
      "}",
      ".training-identity-strip .tis-link:hover{color:#fff;text-decoration:underline;}",
      ".training-identity-strip .tis-link-out{margin-left:0;color:#888;}",
      "@media print { .training-identity-strip { display:none; } }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- Database write helpers --------------------------------------------

  async function recordLessonComplete(moduleId, lessonId) {
    if (!currentUser || !currentUser.id) return { error: "no-session" };
    try {
      // Upsert so re-marking complete doesn't create duplicates
      const { error } = await db
        .from("training_progress")
        .upsert(
          {
            user_id: currentUser.id,
            module_id: moduleId,
            lesson_id: lessonId,
            store_id: currentUser.default_store || null
          },
          { onConflict: "user_id,module_id,lesson_id" }
        );
      if (error) {
        console.error("[training-auth] recordLessonComplete error:", error);
        return { error };
      }
      return { ok: true };
    } catch (e) {
      console.error("[training-auth] recordLessonComplete exception:", e);
      return { error: e };
    }
  }

  async function recordQuizAttempt({
    moduleId,
    score,
    totalQuestions,
    correctAnswers
  }) {
    if (!currentUser || !currentUser.id) return { error: "no-session" };
    try {
      const passed = score >= 80;
      const { error } = await db.from("training_quiz_attempts").insert({
        user_id: currentUser.id,
        module_id: moduleId,
        score: score,
        passed: passed,
        total_questions: totalQuestions || null,
        correct_answers: correctAnswers || null,
        store_id: currentUser.default_store || null
      });
      if (error) {
        console.error("[training-auth] recordQuizAttempt error:", error);
        return { error };
      }
      return { ok: true };
    } catch (e) {
      console.error("[training-auth] recordQuizAttempt exception:", e);
      return { error: e };
    }
  }

  async function fetchMyProgress(moduleId) {
    if (!currentUser || !currentUser.id) return { error: "no-session" };
    try {
      let q = db
        .from("training_progress")
        .select("module_id,lesson_id,completed_at")
        .eq("user_id", currentUser.id);
      if (moduleId) q = q.eq("module_id", moduleId);
      const { data, error } = await q.order("completed_at", { ascending: true });
      if (error) return { error };
      return { ok: true, data: data || [] };
    } catch (e) {
      return { error: e };
    }
  }

  async function fetchMyQuizAttempts(moduleId) {
    if (!currentUser || !currentUser.id) return { error: "no-session" };
    try {
      let q = db
        .from("training_quiz_attempts")
        .select("module_id,score,passed,total_questions,correct_answers,attempted_at")
        .eq("user_id", currentUser.id);
      if (moduleId) q = q.eq("module_id", moduleId);
      const { data, error } = await q.order("attempted_at", { ascending: false });
      if (error) return { error };
      return { ok: true, data: data || [] };
    } catch (e) {
      return { error: e };
    }
  }

  // ---- Expose to module scripts ------------------------------------------
  window.dyerTraining = {
    db: db,
    currentUser: currentUser,
    recordLessonComplete: recordLessonComplete,
    recordQuizAttempt: recordQuizAttempt,
    fetchMyProgress: fetchMyProgress,
    fetchMyQuizAttempts: fetchMyQuizAttempts
  };

  // Render identity strip once DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderIdentityStrip);
  } else {
    renderIdentityStrip();
  }
})();
