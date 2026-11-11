import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

// A plain presentational component — no "use client" needed here.
// It can be rendered from a Server Component (static button) or from
// a Client Component (with an onClick handler attached), since Next.js
// bundles it appropriately depending on where it's used.
export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-blue-700 text-white hover:bg-blue-900"
      : "bg-sky-100 text-blue-950 hover:bg-sky-200";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}