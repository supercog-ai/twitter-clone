"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionState } from "./actions";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  submitLabel: string;
  altText: string;
  altHref: string;
  altLabel: string;
};

export default function AuthForm({
  action,
  title,
  submitLabel,
  altText,
  altHref,
  altLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="mx-auto mt-24 w-full max-w-sm px-4">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="username"
          placeholder="Username"
          autoComplete="username"
          className="rounded-lg border border-neutral-700 bg-transparent px-3 py-2 outline-none focus:border-sky-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-lg border border-neutral-700 bg-transparent px-3 py-2 outline-none focus:border-sky-500"
        />
        {state?.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
        >
          {pending ? "…" : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-400">
        {altText}{" "}
        <Link href={altHref} className="text-sky-500 hover:underline">
          {altLabel}
        </Link>
      </p>
    </div>
  );
}
