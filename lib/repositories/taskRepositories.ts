import { prisma } from "@/lib/prisma";
import { group } from "console";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  groupId: string;
};

export async function getById(
    groupId: string,
    taskId: string
): Promise<Task | null> {
  return prisma.task.findFirst({
    where: { id: taskId, groupId },
  });
}

export async function create(
  groupId: string,
  title: string
): Promise<Task | undefined> {
  if (!group) return undefined;

  return prisma.task.create({
    data: { title, groupId },
  });
}

type UpdateTaskInput = Partial<{
  title: string;
  done: boolean;
}>;

export async function update(
  taskId: string,
  updates: UpdateTaskInput
): Promise<Task | undefined> {
  return prisma.task.update({
    where: { id: taskId},
    data: updates,
  });
}

export async function remove(taskId: string): Promise<void> {
    await prisma.task.delete({ where: { id: taskId } });
}