"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { removeAvatar, uploadAvatar } from "../actions";

export default function AvatarForm({ hasAvatar }: { hasAvatar: boolean }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(uploadAvatar, undefined);
  const [removing, setRemoving] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeAvatar();
      formRef.current?.reset();
      setPreview(null);
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-5"
    >
      <h2 className="text-lg font-semibold">Avatar</h2>
      <p className="text-sm text-neutral-400">
        Upload a photo (PNG, JPG, GIF, WebP). Max 5MB.
      </p>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="preview"
          className="h-24 w-24 self-center rounded-full border border-neutral-800 object-cover"
        />
      )}

      <label className="cursor-pointer rounded-full border border-neutral-700 px-4 py-2 text-center text-sm font-semibold hover:bg-neutral-900">
        Choose image
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </label>

      {state?.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && !state.error && (
        <p className="text-sm text-emerald-400">Avatar updated.</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !preview}
          className="flex-1 rounded-full bg-sky-500 px-5 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save avatar"}
        </button>
        {hasAvatar && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="rounded-full border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900 disabled:opacity-50"
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        )}
      </div>
    </form>
  );
}
