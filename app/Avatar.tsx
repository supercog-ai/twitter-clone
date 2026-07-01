type AvatarProps = {
  username: string;
  avatarUpdatedAt: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-24 w-24 text-3xl",
};

export default function Avatar({
  username,
  avatarUpdatedAt,
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 font-bold text-white ${sizeClass} ${className}`;

  if (!avatarUpdatedAt) {
    return <div className={base}>{username.charAt(0).toUpperCase()}</div>;
  }

  const version = Date.parse(avatarUpdatedAt) || 0;
  const src = `/api/avatars/${encodeURIComponent(username)}?v=${version}`;

  return (
    <div className={base}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${username} avatar`}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
