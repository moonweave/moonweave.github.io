CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  role TEXT NOT NULL,
  area TEXT NOT NULL,
  pain TEXT NOT NULL,
  wish TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
ON submissions (created_at);

