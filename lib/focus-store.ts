"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { archivedTracks as archivedTrackSeeds } from "@/lib/data";

export type FocusTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

type FocusStore = {
  tasks: FocusTask[];
  archivedTracks: string[];
};

const STORAGE_KEY = "time-to-mato:store";
const STORE_EVENT = "time-to-mato:store-change";

const seededTasks: FocusTask[] = [
  {
    id: "task-1",
    title: "Draft the weekly review memo",
    detail: "Isolate one clean 25-minute pass and leave the polish for later.",
    completed: false,
    createdAt: "2024-01-03T09:15:00.000Z",
    completedAt: null,
  },
  {
    id: "task-2",
    title: "Inbox cleared and tagged",
    detail: "Sort the low-friction items and leave deep replies for a later block.",
    completed: true,
    createdAt: "2024-01-03T08:20:00.000Z",
    completedAt: "2024-01-03T08:48:00.000Z",
  },
  {
    id: "task-3",
    title: "Rewrite the opening paragraph",
    detail: "Keep the draft lean and save the references for the second pass.",
    completed: false,
    createdAt: "2024-01-03T10:12:00.000Z",
    completedAt: null,
  },
];

const defaultStore: FocusStore = {
  tasks: seededTasks,
  archivedTracks: archivedTrackSeeds,
};

function readStore(): FocusStore {
  if (typeof window === "undefined") {
    return defaultStore;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultStore;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FocusStore>;
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultStore.tasks,
      archivedTracks: Array.isArray(parsed.archivedTracks)
        ? parsed.archivedTracks
        : defaultStore.archivedTracks,
    };
  } catch {
    return defaultStore;
  }
}

function writeStore(nextStore: FocusStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  window.dispatchEvent(new Event(STORE_EVENT));
}

function formatDay(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function summarizeHistory(tasks: FocusTask[]) {
  const completed = tasks
    .filter((task) => task.completed && task.completedAt)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1));

  const grouped = new Map<string, { done: number; carry: number; total: string }>();

  completed.forEach((task, index) => {
    const stamp = task.completedAt!.slice(0, 10);
    const current = grouped.get(stamp) ?? { done: 0, carry: 0, total: "25m" };
    current.done += 1;
    current.carry = index % 3 === 0 ? 1 : current.carry;
    current.total = `${current.done * 25}m`;
    grouped.set(stamp, current);
  });

  return Array.from(grouped.entries())
    .slice(0, 6)
    .map(([stamp, value]) => {
      const [day, date] = formatDay(stamp).split(", ");
      return {
        day,
        date,
        total: value.total,
        done: value.done,
        carry: value.carry,
      };
    });
}

function buildMonthGrid(tasks: FocusTask[]) {
  const completed = tasks.filter((task) => task.completedAt);
  const today = new Date();
  const cells: number[] = [];

  for (let index = 34; index >= 0; index -= 1) {
    const cellDate = new Date(today);
    cellDate.setDate(today.getDate() - index);
    const stamp = cellDate.toISOString().slice(0, 10);
    const count = completed.filter((task) => task.completedAt?.startsWith(stamp)).length;
    cells.push(Math.min(4, count));
  }

  return cells;
}

export function useFocusStore() {
  const [store, setStore] = useState<FocusStore>(defaultStore);

  useEffect(() => {
    const sync = () => setStore(readStore());
    sync();

    window.addEventListener(STORE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(STORE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updateStore = useCallback((updater: (current: FocusStore) => FocusStore) => {
    const current = readStore();
    const next = updater(current);
    writeStore(next);
    setStore(next);
  }, []);

  const addTask = useCallback(
    (title: string, detail: string) => {
      updateStore((current) => ({
        ...current,
        tasks: [
          {
            id: crypto.randomUUID(),
            title,
            detail,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
          },
          ...current.tasks,
        ],
      }));
    },
    [updateStore],
  );

  const updateTask = useCallback(
    (id: string, patch: Pick<FocusTask, "title" | "detail">) => {
      updateStore((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id ? { ...task, ...patch } : task,
        ),
      }));
    },
    [updateStore],
  );

  const toggleTask = useCallback(
    (id: string) => {
      updateStore((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null,
              }
            : task,
        ),
      }));
    },
    [updateStore],
  );

  const deleteTask = useCallback(
    (id: string) => {
      updateStore((current) => ({
        ...current,
        tasks: current.tasks.filter((task) => task.id !== id),
      }));
    },
    [updateStore],
  );

  const queuedTasks = useMemo(
    () => store.tasks.filter((task) => !task.completed),
    [store.tasks],
  );

  const completedTasks = useMemo(
    () =>
      store.tasks
        .filter((task) => task.completed)
        .sort((a, b) => ((a.completedAt ?? "") < (b.completedAt ?? "") ? 1 : -1)),
    [store.tasks],
  );

  return {
    tasks: store.tasks,
    queuedTasks,
    completedTasks,
    currentTask: queuedTasks[0] ?? null,
    archivedTracks: store.archivedTracks,
    recentHistory: summarizeHistory(store.tasks),
    monthGrid: buildMonthGrid(store.tasks),
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
}
