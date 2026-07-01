import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import Avatar from "./Avatar";
import Composer from "./Composer";
import LogoutButton from "./LogoutButton";

type FeedPost = {
  id: number;
  content: string;
  has_image: boolean;
  created_at: string;
  username: string;
  avatar_updated_at: string | null;
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default async function Home() {
  const user = await getCurrentUser();

  const { rows: posts } = await query<FeedPost>(
    `SELECT p.id,
            p.content,
            (p.image IS NOT NULL) AS has_image,
            p.created_at,
            u.username,
            u.avatar_updated_at
       FROM posts p
       JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT 100`
  );

  return (
    <main className="mx-auto min-h-screen max-w-xl border-x border-neutral-800">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-black/70 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold">🐦 Home</h1>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 hover:bg-neutral-900"
            >
              <Avatar
                username={user.username}
                avatarUpdatedAt={user.avatar_updated_at}
                size="sm"
              />
              <span className="text-sm text-neutral-400">@{user.username}</span>
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm font-semibold hover:bg-neutral-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Sign up
            </Link>
          </div>
        )}
      </header>

      {user ? (
        <Composer
          username={user.username}
          avatarUpdatedAt={user.avatar_updated_at}
        />
      ) : (
        <div className="border-b border-neutral-800 p-4 text-center text-neutral-400">
          <Link href="/signup" className="text-sky-500 hover:underline">
            Sign up
          </Link>{" "}
          or{" "}
          <Link href="/login" className="text-sky-500 hover:underline">
            log in
          </Link>{" "}
          to post.
        </div>
      )}

      <section>
        {posts.length === 0 ? (
          <p className="p-8 text-center text-neutral-500">
            No posts yet. Be the first!
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="flex gap-3 border-b border-neutral-800 p-4"
            >
              <Avatar
                username={post.username}
                avatarUpdatedAt={post.avatar_updated_at}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">{post.username}</span>
                  <span className="text-neutral-500">
                    @{post.username} · {timeAgo(new Date(post.created_at))}
                  </span>
                </div>
                {post.content && (
                  <p className="mt-1 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                )}
                {post.has_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/images/${post.id}`}
                    alt="post image"
                    className="mt-2 max-h-96 w-full rounded-2xl border border-neutral-800 object-cover"
                  />
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
