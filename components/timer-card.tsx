"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@base-ui-components/react";
import { sessionStrip } from "@/lib/data";
import type { FocusTask } from "@/lib/focus-store";

type TimerCardProps = {
  currentTask: FocusTask | null;
  focusMinutes: number;
  breakMinutes: number;
  completedToday: number;
};

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function TimerCard({
  currentTask,
  focusMinutes,
  breakMinutes,
  completedToday,
}: TimerCardProps) {
  const totalSeconds = focusMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? totalSeconds : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running, totalSeconds]);

  const progress = useMemo(
    () => ((totalSeconds - secondsLeft) / Math.max(totalSeconds, 1)) * 100,
    [secondsLeft, totalSeconds],
  );

  const currentBlock = currentTask ? "Current focus" : "Inbox reset";
  const currentTitle = currentTask?.title ?? "No active task yet";
  const currentDetail =
    currentTask?.detail ??
    "Add a task from the button on the right to let the timer and history track real work.";

  return (
    <section className="panel panel-strong surface timer-panel">
      <div className="section-head">
        <div className="timer-copy-shell">
          <p className="section-kicker">Current</p>
          <h2 className="section-title timer-task-title" title={currentTitle}>
            {currentTitle}
          </h2>
          <p className="section-copy timer-task-copy" title={currentDetail}>
            {currentDetail}
          </p>
        </div>
        <div className="metric-chip">{currentBlock}</div>
      </div>

      <div className="timer-stage">
        <div
          className="timer-ring"
          style={
            {
              "--progress": `${progress}%`,
            } as React.CSSProperties
          }
        >
          <div className="timer-core">
            <p className="timer-mode">Focus sprint</p>
            <div className="timer-display-shell">
              <div className="timer-display">{formatClock(secondsLeft)}</div>
            </div>
            <p className="mini-note">
              {completedToday} completed today. Next break: {breakMinutes} min.
            </p>
          </div>
        </div>

        <div className="timer-side">
          <div className="focus-toggle">
            <div>
              <p className="section-kicker">Mode</p>
              <h3>Deep focus</h3>
            </div>
            <Switch.Root
              checked={running}
              onCheckedChange={setRunning}
              className="switch-root"
            >
              <Switch.Thumb className="switch-thumb" />
            </Switch.Root>
          </div>

          <div className="session-inline">
            {sessionStrip.map((item, index) => {
              const minutes = item.label === "Break" ? breakMinutes : item.minutes;
              const label =
                index === 1 ? `Focus ${focusMinutes}m` : item.label;

              return (
                <div key={`${item.label}-${index}`} className="session-step">
                  <span>{label}</span>
                  <strong>{minutes}m</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
