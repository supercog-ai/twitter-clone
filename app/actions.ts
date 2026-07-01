"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type ActionState = { error?: string } | undefined;

export async function signup(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await query("SELECT id FROM users WHERE username = $1", [
    username,
  ]);
  if (existing.rows.length > 0) {
    return { error: "That username is taken." };
  }

  const passwordHash = await hashPassword(password);
  const result = await query<{ id: number }>(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
    [username, passwordHash]
  );

  await createSession(result.rows[0].id);
  redirect("/");
}

export async function login(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const result = await query<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE username = $1",
    [username]
  );
  const user = result.rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function createPost(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const content = String(formData.get("content") ?? "").trim();
  const file = formData.get("image");

  let imageBuffer: Buffer | null = null;
  let imageType: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Uploaded file must be an image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image must be smaller than 5MB.");
    }
    imageBuffer = Buffer.from(await file.arrayBuffer());
    imageType = file.type;
  }

  if (!content && !imageBuffer) {
    return; // nothing to post
  }

  await query(
    "INSERT INTO posts (user_id, content, image, image_type) VALUES ($1, $2, $3, $4)",
    [user.id, content, imageBuffer, imageType]
  );

  revalidatePath("/");
}

export type AvatarActionState = { error?: string; ok?: boolean } | undefined;

export async function uploadAvatar(
  _prev: AvatarActionState,
  formData: FormData
): Promise<AvatarActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be smaller than 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await query(
    "UPDATE users SET avatar = $1, avatar_type = $2, avatar_updated_at = now() WHERE id = $3",
    [buffer, file.type, user.id]
  );

  revalidatePath("/");
  revalidatePath("/profile");
  return { ok: true };
}

export async function removeAvatar(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await query(
    "UPDATE users SET avatar = NULL, avatar_type = NULL, avatar_updated_at = NULL WHERE id = $1",
    [user.id]
  );

  revalidatePath("/");
  revalidatePath("/profile");
}
