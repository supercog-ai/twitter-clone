import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const result = await query<{ avatar: Buffer | null; avatar_type: string | null }>(
    "SELECT avatar, avatar_type FROM users WHERE username = $1",
    [username]
  );
  const row = result.rows[0];

  if (!row?.avatar || !row.avatar_type) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(row.avatar), {
    headers: {
      "Content-Type": row.avatar_type,
      // Avatars are addressed by mutable username, so downstream callers
      // should cache-bust via ?v=<avatar_updated_at>. Keep the cache long
      // once a specific version has been fetched.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
