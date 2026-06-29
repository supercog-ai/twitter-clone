# Twitter Clone (demo)

A minimal Twitter-style app built with **Next.js (App Router)** and **Postgres**.

## Features

- **Signup / login** with just a username + password (no email, no verification)
- bcrypt-hashed passwords, cookie-based sessions stored in Postgres
- **Post** short messages, optionally with an **image** (stored in Postgres, served via an API route)
- Reverse-chronological feed

## Stack

- Next.js 16 (App Router, Server Actions) + React 19 + TypeScript
- Tailwind CSS v4
- PostgreSQL via the `pg` driver (raw SQL, no ORM)
- `bcryptjs` for password hashing

## Prerequisites

- Node.js
- A running PostgreSQL server

## Setup

1. **Create the database** (defaults assume a local Postgres with your shell user):

   ```bash
   createdb twitter_clone
   psql -d twitter_clone -f db/schema.sql
   ```

2. **Configure the connection** in `.env.local`:

   ```
   DATABASE_URL=postgresql://USER@localhost:5432/twitter_clone
   ```

3. **Install & run**:

   ```bash
   npm install
   npm run dev
   ```

   Open http://localhost:3000 (this demo session ran it on port 3100).

4. **(Optional) Load sample data**:

   ```bash
   npm run seed
   ```

   Seeds 4 users (`alice`, `bob`, `sanjay`, `celeste`) and 15 posts, 6 with
   images. Re-running wipes existing posts and reloads the fixture. Newly
   created seed users get the password `password123`; existing users keep
   their own password. Images are generated as SVG cards (`image/svg+xml`).

## Project layout

| Path | Purpose |
|------|---------|
| `db/schema.sql` | `users`, `posts`, `sessions` tables |
| `db/seed.mjs` | Sample-data fixture (`npm run seed`) |
| `lib/db.ts` | Postgres connection pool + `query()` helper |
| `lib/auth.ts` | Password hashing, session create/destroy, `getCurrentUser()` |
| `app/actions.ts` | Server Actions: `signup`, `login`, `logout`, `createPost` |
| `app/page.tsx` | Home feed (Server Component) |
| `app/Composer.tsx` | Client compose box with image preview |
| `app/login`, `app/signup` | Auth pages |
| `app/api/images/[id]/route.ts` | Serves post images from the DB |

## Notes

This is a demo: sessions don't auto-expire-clean, there are no rate limits, and
images are stored as `bytea` in Postgres (fine for a demo, not for scale). The
Server Action body limit is raised to 6 MB in `next.config.ts` to allow image
uploads (capped at 5 MB in code).
