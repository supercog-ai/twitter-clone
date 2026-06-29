"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "./actions";

export default function Composer({ username }: { username: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await createPost(new FormData(e.currentTarget));
      formRef.current?.reset();
      setPreview(null);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex gap-3 border-b border-neutral-800 p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
        {username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <textarea
          name="content"
          rows={2}
          placeholder="What's happening?"
          className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-neutral-500"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="mt-2 max-h-80 rounded-2xl border border-neutral-800 object-cover"
          />
        )}
        <div className="mt-2 flex items-center justify-between">
          <label className="cursor-pointer text-sm text-sky-500 hover:underline">
            📷 Add image
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-sky-500 px-5 py-1.5 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
