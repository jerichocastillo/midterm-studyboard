import Link from "next/link";
import type { Group } from "@/lib/repositories/groupRepositories";

// Purely presentational, no interactivity -> stays a Server Component.
export default function GroupCard({ group }: { group: Group }) {
  const completedCount = group.tasks.filter((t) => t.done).length;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="block rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold">{group.name}</h3>
      <p className="text-sm text-blue-700">{group.subject}</p>
      <div className="mt-2 flex justify-between text-sm text-blue-900">
        <span>{group.memberCount} members</span>
        <span>
          {completedCount}/{group.tasks.length} tasks done
        </span>
      </div>
    </Link>
  );
}