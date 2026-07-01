import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Avatar from "../Avatar";
import AvatarForm from "./AvatarForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto min-h-screen max-w-xl border-x border-neutral-800">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-black/70 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
        <span className="text-sm text-neutral-400">@{user.username}</span>
      </header>

      <section className="flex flex-col items-center gap-6 p-8">
        <Avatar
          username={user.username}
          avatarUpdatedAt={user.avatar_updated_at}
          size="lg"
        />
        <div className="text-center">
          <div className="text-lg font-semibold">{user.username}</div>
          <div className="text-sm text-neutral-500">@{user.username}</div>
        </div>
        <AvatarForm hasAvatar={user.avatar_updated_at !== null} />
      </section>
    </main>
  );
}
