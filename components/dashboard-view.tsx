"use client";

import { FormEvent, useMemo, useState } from "react";
import { TimerCard } from "@/components/timer-card";
import { type FocusTask, useFocusStore } from "@/lib/focus-store";

export function DashboardView() {
  const {
    currentTask,
    queuedTasks,
    completedTasks,
    recentHistory,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useFocusStore();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDetail, setEditingDetail] = useState("");

  const completedLabel = useMemo(
    () => `${completedTasks.length} closed`,
    [completedTasks.length],
  );

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeTitle = title.trim();
    const safeDetail = detail.trim();
    if (!safeTitle) return;

    addTask(safeTitle, safeDetail || "A new task ready for a clean focus block.");
    setTitle("");
    setDetail("");
  }

  function startEditing(task: FocusTask) {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setEditingDetail(task.detail);
  }

  function saveEditing(taskId: string) {
    const safeTitle = editingTitle.trim();
    if (!safeTitle) return;
    updateTask(taskId, {
      title: safeTitle,
      detail: editingDetail.trim() || "Task details intentionally left light.",
    });
    setEditingId(null);
  }

  return (
    <main className="workspace">
      <div className="workspace-grid">
        <TimerCard currentTask={currentTask} />

        <aside className="stack">
          <section className="panel surface">
            <div className="section-head">
              <div>
                <p className="section-kicker">Create</p>
                <h2 className="section-title">Add a task</h2>
              </div>
              <div className="metric-chip">{queuedTasks.length} queued</div>
            </div>

            <form className="task-form" onSubmit={handleCreateTask}>
              <label className="task-field">
                <span>Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Plan the next calm block"
                />
              </label>
              <label className="task-field">
                <span>Detail</span>
                <textarea
                  value={detail}
                  onChange={(event) => setDetail(event.target.value)}
                  placeholder="A short note for what “done” looks like."
                  rows={3}
                />
              </label>
              <button type="submit" className="task-button">
                Save task
              </button>
            </form>
          </section>

          <section className="panel surface">
            <div className="section-head">
              <div>
                <p className="section-kicker">Done</p>
                <h2 className="section-title">Completed tasks</h2>
              </div>
              <div className="metric-chip">{completedLabel}</div>
            </div>
            <ul className="clean-list task-list">
              {completedTasks.length === 0 ? (
                <li className="empty-state">Finished work will collect here.</li>
              ) : (
                completedTasks.map((task) => (
                  <li key={task.id}>
                    <span className="task-state task-state--done" />
                    <div className="task-copy">
                      <strong>{task.title}</strong>
                      <span>{task.detail}</span>
                    </div>
                    <div className="task-actions">
                      <button type="button" onClick={() => toggleTask(task.id)}>
                        Reopen
                      </button>
                      <button type="button" onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>

      <section className="panel surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Queue</p>
            <h2 className="section-title">Edit and move active tasks</h2>
            <p className="section-copy">
              Every item can be updated, completed, or removed without leaving the
              dashboard.
            </p>
          </div>
          <div className="metric-chip">{queuedTasks.length} active</div>
        </div>

        <ul className="clean-list task-list task-list--soft">
          {queuedTasks.length === 0 ? (
            <li className="empty-state">
              No active tasks yet. Add one above to start tracking.
            </li>
          ) : (
            queuedTasks.map((task) => {
              const editing = editingId === task.id;
              return (
                <li key={task.id} className="task-item-vertical">
                  <div className="task-main">
                    <span className="task-state" />
                    <div className="task-copy task-copy--stretch">
                      {editing ? (
                        <>
                          <input
                            className="task-inline-input"
                            value={editingTitle}
                            onChange={(event) => setEditingTitle(event.target.value)}
                          />
                          <textarea
                            className="task-inline-textarea"
                            value={editingDetail}
                            onChange={(event) => setEditingDetail(event.target.value)}
                            rows={2}
                          />
                        </>
                      ) : (
                        <>
                          <strong>{task.title}</strong>
                          <span>{task.detail}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    {editing ? (
                      <>
                        <button type="button" onClick={() => saveEditing(task.id)}>
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEditing(task)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => toggleTask(task.id)}>
                          Done
                        </button>
                        <button type="button" onClick={() => deleteTask(task.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className="panel surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Recent</p>
            <h2 className="section-title">This week at a glance</h2>
            <p className="section-copy">
              History now reflects the tasks you actually complete in the dashboard.
            </p>
          </div>
          <div className="metric-chip">{recentHistory.length} tracked days</div>
        </div>

        <div className="history-grid">
          {recentHistory.length === 0 ? (
            <article className="history-row">
              <div>
                <p className="history-day">No finished work yet</p>
                <p className="mini-note">
                  Complete a task and it will show up here and on the history page.
                </p>
              </div>
            </article>
          ) : (
            recentHistory.map((entry) => (
              <article key={entry.date} className="history-row">
                <div>
                  <p className="history-day">
                    {entry.day} <span>{entry.date}</span>
                  </p>
                  <p className="mini-note">{entry.total} of quiet work</p>
                </div>
                <div className="history-meta">
                  <span>{entry.done} done</span>
                  <span>{entry.carry} carry</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
