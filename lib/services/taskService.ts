import * as taskRepositories from "@/lib/repositories/taskRepositories";
import type { Task } from "@/lib/repositories/taskRepositories";
import * as groupRepositories from "@/lib/repositories/groupRepositories";
import { ForbiddenError, NotFoundError } from "../errors";
import { emitGroup } from "../socket";

export async function createTask(
    groupId: string,
    userId: string,
    title: string,
    excludeSocketId?: string | null
) : Promise<Task | undefined> {
    const group = await groupRepositories.getById(groupId);
    if(!group) {
        throw new NotFoundError("Group not found");
    }
    if(group.ownerId !== userId) {
        throw new ForbiddenError("You are not the owner of this group");
            }

    const task = await taskRepositories.create(groupId, title);

    emitGroup(groupId, "task:created", task, excludeSocketId);

    return task;
}

type UpdateTaskInput = Partial<{
    title: string;
    done: boolean;
}>;

export async function updateTask(
    groupId: string,
    taskId: string,
    userId: string,
    updates: UpdateTaskInput
): Promise<Task | undefined> {
    const group = await groupRepositories.getById(groupId);
    if(!group) {
        throw new NotFoundError("Group not found");
    }
    if(group.ownerId !== userId) {
        throw new ForbiddenError("You are not the owner of this group");
    }

    const existingTask = await taskRepositories.getById(groupId, taskId);
    if(!existingTask) {
        throw new NotFoundError("Task not found");
    }

    const updated = await taskRepositories.update(taskId, updates);

    emitGroup(groupId, "task:updated", updated);

    return updated;
}

export async function deleteTask(
    groupId: string,
    taskId: string,
    userId: string,
) : Promise<void> {
    const group = await groupRepositories.getById(groupId);
    if(!group) {
        throw new NotFoundError("Group not found");
    }
    if(group.ownerId !== userId) {
        throw new ForbiddenError("You are not the owner of this group");
    }

    const existingTask = await taskRepositories.getById(groupId, taskId);
    if(!existingTask) {
        throw new NotFoundError("Task not found");
    }

    await taskRepositories.remove(taskId);

    emitGroup(groupId, "task:deleted", { taskId });
}