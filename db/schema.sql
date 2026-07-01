-- Twitter clone schema

CREATE TABLE IF NOT EXISTS users (
  id                 SERIAL PRIMARY KEY,
  username           TEXT NOT NULL UNIQUE,
  password_hash      TEXT NOT NULL,
  avatar             BYTEA,
  avatar_type        TEXT,
  avatar_updated_at  TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Backfill columns on databases created before avatars existed.
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar            BYTEA;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_type       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL DEFAULT '',
  image      BYTEA,
  image_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
