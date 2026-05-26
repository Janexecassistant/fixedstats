/* ========================================================================
   Dyer Automotive Fixed Operations Training
   Module 05: Phone Skills
   ======================================================================== */

const MODULE_KEY = "dyer_customer_comms_progress_v1";
const TOTAL_LESSONS = 7;

function loadProgress() {
  try { const raw = localStorage.getItem(MODULE_KEY); return raw ? JSON.parse(raw) : { completed: [], quiz: null }; }
  catch (_) { return { completed: [], quiz: null }; }
}
function saveProgress(p) { try { localStorage.setItem(MODULE_KEY, JSON.stringify(p)); } catch (_) {} }
function markComplete(lessonId) {
  const p = loadProgress();
  if (!p.completed.includes(lessonId)) { p.completed.push(lessonId); saveProgress(p); }
  renderProgress();
  if (window.dyerTraining && window.dyerTraining.recordLessonComplete) {
    window.dyerTraining.recordLessonComplete("customer-comms", lessonId)
      .catch(e => console.warn("[customer-comms] recordLessonComplete failed:", e));
  }
}
async function hydrateProgressFromDb() {
  if (!window.dyerTraining || !window.dyerTraining.fetchMyProgress) return;
  try {
    const res = await window.dyerTraining.fetchMyProgress("customer-comms");
    if (res && res.ok && Array.isArray(res.data)) {
      const p = loadProgress();
      const serverLessons = res.data.map(r => r.lesson_id);
      const merged = Array.from(new Set([...(p.completed || []), ...serverLessons]));
      if (merged.length !== (p.completed || []).length) { p.completed = merged; saveProgress(p); renderProgress(); }
    }
  } catch (e) {}
}
function resetProgress() {
  if (confirm("Reset all module progress, quiz scores, and checklists? This cannot be undone.")) {
    localStorage.removeItem(MODULE_KEY);
    Object.keys(localStorage).filter(k => k.startsWith("dyer_phone_skills_")).forEach(k => localStorage.removeItem(k));
    location.reload();
  }
}
function renderProgress() {
  const p = loadProgress();
  const pct = Math.round((p.completed.length / TOTAL_LESSONS) * 100);
  const fill = document.querySelector(".progress-fill");
  const text = document.querySelector(".progress-text");
  if (fill) fill.style.width = pct + "%";
  if (text) text.textContent = `${p.completed.length} of ${TOTAL_LESSONS} lessons complete (${pct}%)`;
  document.querySelectorAll(".lesson-tile[data-lesson]").forEach(tile => {
    const id = tile.getAttribute("data-lesson");
    if (p.completed.includes(id)) tile.classList.add("is-complete"); else tile.classList.remove("is-complete");
  });
}
function initChecklists() {
  document.querySelectorAll(".checklist").forEach(list => {
    const key = "dyer_phone_skills_chk_" + (list.getAttribute("data-checklist") || "default");
    let state = {};
    try { state = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) {}
    list.querySelectorAll("li").forEach((li, idx) => {
      const cb = li.querySelector("input[type=checkbox]");
      const itemKey = "i" + idx;
      if (state[itemKey]) { cb.checked = true; li.classList.add("checked"); }
      li.addEventListener("click", e => {
        if (e.target.tagName !== "INPUT") cb.checked = !cb.checked;
        if (cb.checked) li.classList.add("checked"); else li.classList.remove("checked");
        state[itemKey] = cb.checked;
        localStorage.setItem(key, JSON.stringify(state));
      });
    });
  });
}
function initQuiz() {
  const form = document.getElementById("quiz");
  if (!form) return;
  const answers = {};
  form.querySelectorAll(".quiz-q").forEach(qEl => {
    const qId = qEl.getAttribute("data-q");
    const correct = qEl.getAttribute("data-correct");
    qEl.querySelectorAll(".quiz-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        if (qEl.classList.contains("is-locked")) return;
        const val = opt.getAttribute("data-val");
        qEl.querySelectorAll(".quiz-opt").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        answers[qId] = { selected: val, correct };
      });
    });
  });
  const submit = document.getElementById("quiz-submit");
  if (submit) submit.addEventListener("click", () => {
    let totalQ = 0, right = 0;
    form.querySelectorAll(".quiz-q").forEach(qEl => {
      totalQ++;
      const qId = qEl.getAttribute("data-q");
      const correct = qEl.getAttribute("data-correct");
      const ans = answers[qId];
      qEl.classList.add("is-locked");
      qEl.querySelectorAll(".quiz-opt").forEach(o => {
        const v = o.getAttribute("data-val");
        if (v === correct) o.classList.add("correct");
        if (ans && ans.selected === v && v !== correct) o.classList.add("incorrect");
      });
      const fb = qEl.querySelector(".quiz-feedback");
      if (fb) {
        if (ans && ans.selected === correct) { fb.classList.add("show", "right"); right++; }
        else { fb.classList.add("show", "wrong"); }
      }
    });
    const pct = Math.round((right / totalQ) * 100);
    const result = document.getElementById("quiz-result");
    const scoreEl = document.getElementById("quiz-score");
    const passEl = document.getElementById("quiz-pass-msg");
    if (result) result.classList.add("show");
    if (pct >= 80) result.classList.add("passed");
    if (scoreEl) scoreEl.textContent = pct + "%";
    if (passEl) {
      passEl.textContent = pct >= 80
        ? `You scored ${right} of ${totalQ}. Your next call should sound like a pro.`
        : `You scored ${right} of ${totalQ}. Below the 80% standard. Review the lessons and retake.`;
    }
    submit.style.display = "none";
    const retake = document.getElementById("quiz-retake");
    if (retake) retake.style.display = "inline-flex";
    const p = loadProgress();
    p.quiz = { score: pct, right, total: totalQ, when: new Date().toISOString() };
    saveProgress(p);
    if (window.dyerTraining && window.dyerTraining.recordQuizAttempt) {
      window.dyerTraining.recordQuizAttempt({
        moduleId: "customer-comms", score: pct, totalQuestions: totalQ, correctAnswers: right
      }).catch(e => console.warn("[customer-comms] recordQuizAttempt failed:", e));
    }
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  const retake = document.getElementById("quiz-retake");
  if (retake) retake.addEventListener("click", () => location.reload());
}
function initRoleplay() {
  document.querySelectorAll(".roleplay").forEach(rp => {
    const choices = rp.querySelectorAll(".choice");
    choices.forEach(btn => {
      btn.addEventListener("click", () => {
        const kind = btn.getAttribute("data-kind");
        choices.forEach(c => c.disabled = true);
        btn.classList.add(kind === "good" ? "good" : "bad");
        const fbId = btn.getAttribute("data-feedback");
        const fb = document.getElementById(fbId);
        if (fb) { fb.classList.add("show"); fb.classList.add(kind === "good" ? "good" : "bad"); }
      });
    });
  });
}
function initScorecard() {
  const card = document.getElementById("scorecard");
  if (!card) return;
  const KEY = "dyer_phone_skills_scorecard";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}
  card.querySelectorAll("input[type=radio]").forEach(r => { if (saved[r.name] === r.value) r.checked = true; });
  card.querySelectorAll("input[type=text], input[type=date], textarea").forEach(f => { if (saved[f.name]) f.value = saved[f.name]; });
  function updateTotal() {
    let total = 0, count = 0;
    card.querySelectorAll(".score-row").forEach(row => {
      const checked = row.querySelector("input[type=radio]:checked");
      if (checked) { total += parseInt(checked.value, 10); count++; }
    });
    const max = card.querySelectorAll(".score-row").length * 5;
    document.getElementById("score-total-num").textContent = total + " / " + max;
    let rating = "—";
    const pct = count ? (total / (count * 5)) * 100 : 0;
    if (count > 0) {
      if (pct >= 90) rating = "Excellent — coach others";
      else if (pct >= 75) rating = "Strong — minor coaching opportunities";
      else if (pct >= 60) rating = "Developing — targeted coaching needed";
      else if (pct >= 40) rating = "Below standard — structured retraining";
      else rating = "Not meeting expectations — immediate intervention";
    }
    document.getElementById("score-rating").textContent = rating;
  }
  card.addEventListener("input", e => {
    const t = e.target;
    if (t.name) saved[t.name] = t.value;
    if (t.type === "radio" && t.checked) saved[t.name] = t.value;
    localStorage.setItem(KEY, JSON.stringify(saved));
    updateTotal();
  });
  document.getElementById("score-print").addEventListener("click", () => window.print());
  document.getElementById("score-clear").addEventListener("click", () => {
    if (confirm("Clear this scorecard?")) { localStorage.removeItem(KEY); location.reload(); }
  });
  updateTotal();
}
function initLessonComplete() {
  const btn = document.getElementById("mark-complete");
  if (!btn) return;
  const lessonId = btn.getAttribute("data-lesson");
  const p = loadProgress();
  if (p.completed.includes(lessonId)) {
    btn.textContent = "Lesson Complete ✓";
    btn.classList.add("btn-secondary");
    btn.classList.remove("btn");
  }
  btn.addEventListener("click", () => {
    markComplete(lessonId);
    btn.textContent = "Lesson Complete ✓";
    btn.classList.add("btn-secondary");
    btn.classList.remove("btn");
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderProgress();
  initChecklists();
  initQuiz();
  initRoleplay();
  initScorecard();
  initLessonComplete();
  const resetBtn = document.getElementById("reset-progress");
  if (resetBtn) resetBtn.addEventListener("click", resetProgress);
  hydrateProgressFromDb();
});
