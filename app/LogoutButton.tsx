import { logout } from "./actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-full border border-neutral-700 px-4 py-1.5 text-sm font-semibold transition hover:bg-neutral-900"
      >
        Log out
      </button>
    </form>
  );
}
