import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await query<{ image: Buffer | null; image_type: string | null }>(
    "SELECT image, image_type FROM posts WHERE id = $1",
    [postId]
  );
  const row = result.rows[0];

  if (!row?.image || !row.image_type) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(row.image), {
    headers: {
      "Content-Type": row.image_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
