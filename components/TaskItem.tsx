"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/repositories/taskRepositories";
import { socket } from "@/lib/socketClient";

export default function TaskItem({
  task,
  isOwner,
  groupId,
}: {
  task: Task;
  isOwner: boolean;
  groupId: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(task.done);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTaskUpdated = (updatedTask: Task) => {
      if (updatedTask.id !== task.id) return;

      setDone(updatedTask.done);
      setError(null);
      router.refresh();
    };

    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [router, task.id]);

  async function handleToggle() {
    if (!isOwner) return;

    const previousValue = done;
    const newValue = !done;

    setDone(newValue);
    setError(null);

    const res = await fetch(`/api/groups/${groupId}/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ done: newValue }),
    });

    if (!res.ok) {
      setDone(previousValue);
      setError("Couldn't update task.");
    }
  }

  async function handleDelete() {
    if (!isOwner) return;

    setIsDeleting(true);
    setError(null);

    const res = await fetch(`/api/groups/${groupId}/tasks/${task.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setIsDeleting(false);
      setError("Couldn't delete task.");
      return;
    }

    router.refresh();
  }

  return (
    <li className="flex items-center gap-3 rounded-md border border-blue-800 px-3 py-2 text-blue-950 hover:bg-blue-100">
      <input
        type="checkbox"
        checked={done}
        disabled={!isOwner}
        onChange={handleToggle}
        className="h-4 w-4 accent-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span className={done ? "line-through text-blue-500" : ""}>
        {task.title}
      </span>
      {isOwner && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-auto text-xs text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </li>
  );
}