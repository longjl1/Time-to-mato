"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { archivedTracks as archivedTrackSeeds } from "@/lib/data";

export const TITLE_LIMIT = 72;
export const DETAIL_LIMIT = 180;

export type FocusTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type FocusSettings = {
  darkMode: boolean;
  focusMinutes: number;
  breakMinutes: number;
  dailyGoal: number;
};

type FocusStore = {
  tasks: FocusTask[];
  archivedTracks: string[];
  settings: FocusSettings;
};

const STORAGE_KEY = "time-to-mato:store";
const STORE_EVENT = "time-to-mato:store-change";

const seededTasks: FocusTask[] = [
  {
    id: "task-1",
    title: "Draft the weekly review memo",
    detail: "Isolate one clean focus pass and leave the polish for later.",
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

const defaultSettings: FocusSettings = {
  darkMode: false,
  focusMinutes: 25,
  breakMinutes: 5,
  dailyGoal: 4,
};

const defaultStore: FocusStore = {
  tasks: seededTasks,
  archivedTracks: archivedTrackSeeds,
  settings: defaultSettings,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value: string, limit: number) {
  return value.trim().slice(0, limit);
}

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
      settings: {
        ...defaultSettings,
        ...(parsed.settings ?? {}),
      },
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

function summarizeHistory(tasks: FocusTask[], focusMinutes: number) {
  const completed = tasks
    .filter((task) => task.completed && task.completedAt)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1));

  const grouped = new Map<string, { done: number; carry: number; total: string }>();

  completed.forEach((task, index) => {
    const stamp = task.completedAt!.slice(0, 10);
    const current = grouped.get(stamp) ?? { done: 0, carry: 0, total: `${focusMinutes}m` };
    current.done += 1;
    current.carry = index % 3 === 0 ? 1 : current.carry;
    current.total = `${current.done * focusMinutes}m`;
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

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = store.settings.darkMode ? "dark" : "light";
  }, [store.settings.darkMode]);

  const updateStore = useCallback((updater: (current: FocusStore) => FocusStore) => {
    const current = readStore();
    const next = updater(current);
    writeStore(next);
    setStore(next);
  }, []);

  const addTask = useCallback(
    (title: string, detail: string) => {
      const safeTitle = normalizeText(title, TITLE_LIMIT);
      const safeDetail = normalizeText(detail, DETAIL_LIMIT);
      if (!safeTitle) return;

      updateStore((current) => ({
        ...current,
        tasks: [
          {
            id: crypto.randomUUID(),
            title: safeTitle,
            detail: safeDetail || "A new task ready for a clean focus block.",
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
          task.id === id
            ? {
                ...task,
                title: normalizeText(patch.title, TITLE_LIMIT),
                detail:
                  normalizeText(patch.detail, DETAIL_LIMIT) ||
                  "Task details intentionally left light.",
              }
            : task,
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

  const updateSettings = useCallback(
    (patch: Partial<FocusSettings>) => {
      updateStore((current) => ({
        ...current,
        settings: {
          ...current.settings,
          ...patch,
          focusMinutes: clamp(patch.focusMinutes ?? current.settings.focusMinutes, 10, 90),
          breakMinutes: clamp(patch.breakMinutes ?? current.settings.breakMinutes, 3, 30),
          dailyGoal: clamp(patch.dailyGoal ?? current.settings.dailyGoal, 1, 12),
        },
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

  const completedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return completedTasks.filter((task) => task.completedAt?.startsWith(today)).length;
  }, [completedTasks]);

  return {
    tasks: store.tasks,
    settings: store.settings,
    queuedTasks,
    completedTasks,
    completedToday,
    currentTask: queuedTasks[0] ?? null,
    archivedTracks: store.archivedTracks,
    recentHistory: summarizeHistory(store.tasks, store.settings.focusMinutes),
    monthGrid: buildMonthGrid(store.tasks),
    estimatedQueueMinutes: queuedTasks.length * store.settings.focusMinutes,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    updateSettings,
  };
}
