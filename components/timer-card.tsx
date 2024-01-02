"use client";

import { useEffect, useMemo, useState } from "react";
import { Switch } from "@base-ui-components/react";
import { sessionStrip } from "@/lib/data";
import type { FocusTask } from "@/lib/focus-store";

const totalSeconds = 25 * 60;

function formatClock(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

type TimerCardProps = {
  currentTask: FocusTask | null;
};

export function TimerCard({ currentTask }: TimerCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;

    const id = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? totalSeconds : prev - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [running]);

  const progress = useMemo(
    () => ((totalSeconds - secondsLeft) / totalSeconds) * 100,
    [secondsLeft],
  );

  const currentBlock = currentTask ? "Current focus" : "Inbox reset";
  const currentTitle = currentTask?.title ?? "No active task yet";
  const currentDetail =
    currentTask?.detail ??
    "Add a task in the queue to let the timer and history track real work.";

  return (
    <section className="panel panel-strong surface timer-panel">
      <div className="section-head">
        <div>
          <p className="section-kicker">Current</p>
          <h2 className="section-title">{currentTitle}</h2>
          <p className="section-copy">{currentDetail}</p>
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
            <div className="timer-display">{formatClock(secondsLeft)}</div>
            <p className="mini-note">Quiet, grayscale, and one thing at a time.</p>
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
            {sessionStrip.map((item) => (
              <div key={`${item.label}-${item.minutes}`} className="session-step">
                <span>{item.label}</span>
                <strong>{item.minutes}m</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
