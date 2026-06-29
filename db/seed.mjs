// Seed fixture: 4 users and 15 posts (6 with images).
//
// Run with:  npm run seed
// (which loads .env.local for DATABASE_URL)
//
// Re-running wipes existing posts and re-inserts the fixture so the feed is
// always in a known state. Existing user passwords are preserved; newly
// created seed users get the password "password123".

import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Image helper: build a simple SVG "card" stored as image/svg+xml ---
function svgCard({ emoji, title, subtitle, from, to }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="350" fill="url(#g)"/>
  <text x="50" y="150" font-size="90" font-family="sans-serif">${emoji}</text>
  <text x="52" y="240" font-size="40" font-weight="bold" fill="white" font-family="sans-serif">${title}</text>
  <text x="52" y="285" font-size="22" fill="rgba(255,255,255,0.85)" font-family="sans-serif">${subtitle}</text>
</svg>`;
}

const images = {
  deploy: svgCard({
    emoji: "🚀",
    title: "Deploy succeeded",
    subtitle: "build passed in 42s · production",
    from: "#16a34a",
    to: "#065f46",
  }),
  sunset: svgCard({
    emoji: "🌅",
    title: "Tonight's sunset",
    subtitle: "from the balcony",
    from: "#f97316",
    to: "#7c3aed",
  }),
  blog: svgCard({
    emoji: "📝",
    title: "Postgres tips",
    subtitle: "...I wish I knew sooner",
    from: "#0ea5e9",
    to: "#1e3a8a",
  }),
  pasta: svgCard({
    emoji: "🍝",
    title: "Homemade pasta",
    subtitle: "worth every minute",
    from: "#f59e0b",
    to: "#b91c1c",
  }),
  code: svgCard({
    emoji: "💻",
    title: "Weekend project",
    subtitle: "a tiny twitter clone",
    from: "#334155",
    to: "#0f172a",
  }),
  pizza: svgCard({
    emoji: "🍕",
    title: "Team lunch",
    subtitle: "the best kind of meeting",
    from: "#ef4444",
    to: "#f59e0b",
  }),
};

const SEED_USERS = ["alice", "bob", "sanjay", "celeste"];

// Posts, newest last. `image` references a key in `images` (or null).
// `minsAgo` controls created_at so the feed has a natural spread.
const POSTS = [
  { user: "bob", text: "Just deployed my first Next.js app 🚀 feeling unstoppable", image: "deploy", minsAgo: 2880 },
  { user: "alice", text: "Coffee count today: 4 ☕ send help", image: null, minsAgo: 2700 },
  { user: "sanjay", text: "Hot take: tabs > spaces. fight me 🥊", image: null, minsAgo: 2500 },
  { user: "celeste", text: "Sunset from my balcony tonight 🌅", image: "sunset", minsAgo: 2300 },
  { user: "bob", text: "Why does my code work at 2am but not at 2pm 🤔", image: null, minsAgo: 1900 },
  { user: "alice", text: "New blog post: 'Postgres tips I wish I knew sooner'", image: "blog", minsAgo: 1600 },
  { user: "sanjay", text: "Debugging is being a detective in a crime movie where you are also the murderer", image: null, minsAgo: 1400 },
  { user: "celeste", text: "Made pasta from scratch today 🍝 100% worth it", image: "pasta", minsAgo: 1100 },
  { user: "bob", text: "shipping > perfection. always.", image: null, minsAgo: 900 },
  { user: "alice", text: "TIL you can index a JSONB column in Postgres. mind blown 🤯", image: null, minsAgo: 720 },
  { user: "sanjay", text: "weekend project: building a tiny twitter clone. it's coming along!", image: "code", minsAgo: 540 },
  { user: "celeste", text: "morning run done ✅ 5k before breakfast", image: null, minsAgo: 360 },
  { user: "bob", text: "anyone else have 47 browser tabs open right now or just me", image: null, minsAgo: 180 },
  { user: "alice", text: "team lunch today 🍕 the best kind of meeting", image: "pizza", minsAgo: 60 },
  { user: "sanjay", text: "reminder: take breaks. your brain needs them. 🧠", image: null, minsAgo: 15 },
];

async function main() {
  const defaultHash = bcrypt.hashSync("password123", 10);

  // Upsert users. Existing users keep their password (the SET is a no-op on
  // the username); new users are inserted with the default password.
  const userIds = {};
  for (const username of SEED_USERS) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash)
         VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
       RETURNING id`,
      [username, defaultHash]
    );
    userIds[username] = rows[0].id;
  }

  // Reset posts so the fixture is deterministic.
  await pool.query("DELETE FROM posts");

  let withImages = 0;
  for (const p of POSTS) {
    const svg = p.image ? Buffer.from(images[p.image]) : null;
    const type = p.image ? "image/svg+xml" : null;
    if (svg) withImages++;
    await pool.query(
      `INSERT INTO posts (user_id, content, image, image_type, created_at)
         VALUES ($1, $2, $3, $4, now() - ($5 || ' minutes')::interval)`,
      [userIds[p.user], p.text, svg, type, String(p.minsAgo)]
    );
  }

  console.log(
    `Seeded ${SEED_USERS.length} users and ${POSTS.length} posts (${withImages} with images).`
  );
  console.log(`Users: ${SEED_USERS.join(", ")}  ·  new users password: "password123"`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
