-- =====================================================================
-- Dyer Automotive Fixed Operations Training — Phase 1 Schema
-- =====================================================================
-- Adds per-user training progress and quiz score tracking, tied to the
-- existing app_users table. Run this once in your Supabase SQL editor.
--
-- Tables created:
--   1. training_progress       — one row per (user, module, lesson) completion
--   2. training_quiz_attempts  — one row per quiz submission
--
-- Note on user_id type: this SQL assumes app_users.id is UUID (Supabase
-- default). If your app_users.id is a different type (text, bigint, etc.),
-- change the user_id column type to match before running.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. training_progress
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  module_id       TEXT NOT NULL,        -- 'walkaround', 'mpvi', etc.
  lesson_id       TEXT NOT NULL,        -- 'lesson1', 'lesson2', ...
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  store_id        TEXT,                 -- store context at completion (for reporting)
  CONSTRAINT      training_progress_unique UNIQUE (user_id, module_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_training_progress_user   ON training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module ON training_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_store  ON training_progress(store_id);


-- ---------------------------------------------------------------------
-- 2. training_quiz_attempts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS training_quiz_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  module_id         TEXT NOT NULL,
  score             INT NOT NULL,        -- 0-100 percentage
  passed            BOOLEAN NOT NULL,    -- >= 80 = passed
  total_questions   INT,
  correct_answers   INT,
  attempted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  store_id          TEXT
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user   ON training_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module ON training_quiz_attempts(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_store  ON training_quiz_attempts(store_id);


-- ---------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------
-- Matches the permissiveness pattern of the existing fixedstats app
-- (anon key used for direct queries, application-layer trust boundary).
-- Phase 2 will tighten this with role-aware reads via stored procedures.

ALTER TABLE training_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_quiz_attempts  ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies so this is rerunnable
DROP POLICY IF EXISTS "training_progress_select"  ON training_progress;
DROP POLICY IF EXISTS "training_progress_insert"  ON training_progress;
DROP POLICY IF EXISTS "training_progress_update"  ON training_progress;
DROP POLICY IF EXISTS "quiz_attempts_select"      ON training_quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert"      ON training_quiz_attempts;

-- training_progress — allow read/insert/update (upsert) for anon
CREATE POLICY "training_progress_select" ON training_progress FOR SELECT USING (true);
CREATE POLICY "training_progress_insert" ON training_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "training_progress_update" ON training_progress FOR UPDATE USING (true);

-- training_quiz_attempts — read + insert (we keep history, never update)
CREATE POLICY "quiz_attempts_select" ON training_quiz_attempts FOR SELECT USING (true);
CREATE POLICY "quiz_attempts_insert" ON training_quiz_attempts FOR INSERT WITH CHECK (true);


-- ---------------------------------------------------------------------
-- 4. Helper view: latest quiz score per user per module
-- ---------------------------------------------------------------------
-- Convenient for dashboards. Surfaces the most recent attempt only.

CREATE OR REPLACE VIEW v_latest_quiz_score AS
SELECT DISTINCT ON (user_id, module_id)
  user_id,
  module_id,
  score,
  passed,
  total_questions,
  correct_answers,
  attempted_at,
  store_id
FROM training_quiz_attempts
ORDER BY user_id, module_id, attempted_at DESC;


-- ---------------------------------------------------------------------
-- 5. Helper view: training compliance per user per module
-- ---------------------------------------------------------------------
-- Rolls up completion + latest quiz into one row per (user, module).
-- Used by the personal dashboard and (Phase 2) manager rollups.

CREATE OR REPLACE VIEW v_training_compliance AS
SELECT
  u.id                                          AS user_id,
  u.display_name,
  u.username,
  u.role,
  u.default_store,
  tp.module_id,
  COUNT(tp.lesson_id)                           AS lessons_completed,
  MAX(tp.completed_at)                          AS last_lesson_at,
  lq.score                                      AS latest_quiz_score,
  lq.passed                                     AS quiz_passed,
  lq.attempted_at                               AS quiz_attempted_at
FROM app_users u
LEFT JOIN training_progress tp ON tp.user_id = u.id
LEFT JOIN v_latest_quiz_score lq
       ON lq.user_id = u.id
      AND lq.module_id = tp.module_id
WHERE tp.module_id IS NOT NULL
GROUP BY u.id, u.display_name, u.username, u.role, u.default_store,
         tp.module_id, lq.score, lq.passed, lq.attempted_at;


-- =====================================================================
-- DONE — verify with:
--   SELECT * FROM training_progress LIMIT 5;
--   SELECT * FROM training_quiz_attempts LIMIT 5;
--   SELECT * FROM v_training_compliance LIMIT 5;
-- =====================================================================
