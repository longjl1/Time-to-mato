"use client";

import { Dialog } from "@base-ui-components/react";
import { FormEvent, useMemo, useState } from "react";
import { SettingsCard } from "@/components/settings-card";
import { TimerCard } from "@/components/timer-card";
import {
  DETAIL_LIMIT,
  TITLE_LIMIT,
  type FocusTask,
  useFocusStore,
} from "@/lib/focus-store";

export function DashboardView() {
  const {
    currentTask,
    queuedTasks,
    completedTasks,
    recentHistory,
    completedToday,
    estimatedQueueMinutes,
    settings,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    updateSettings,
  } = useFocusStore();
  const [dialogOpen, setDialogOpen] = useState(false);
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
    if (!safeTitle) return;

    addTask(title, detail);
    setTitle("");
    setDetail("");
    setDialogOpen(false);
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
      title: editingTitle,
      detail: editingDetail,
    });
    setEditingId(null);
  }

  return (
    <main className="workspace">
      <div className="workspace-grid">
        <TimerCard
          currentTask={currentTask}
          focusMinutes={settings.focusMinutes}
          breakMinutes={settings.breakMinutes}
          completedToday={completedToday}
        />

        <aside className="stack">
          <SettingsCard
            settings={settings}
            completedToday={completedToday}
            estimatedQueueMinutes={estimatedQueueMinutes}
            onUpdateSettings={updateSettings}
          />

          <section className="panel surface">
            <div className="section-head">
              <div>
                <p className="section-kicker">Create</p>
                <h2 className="section-title">Add a task</h2>
                <p className="section-copy">
                  Keep the dashboard quiet until you explicitly open the task composer.
                </p>
              </div>
              <div className="metric-chip">{queuedTasks.length} queued</div>
            </div>

            <div className="launch-row">
              <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                <Dialog.Trigger className="task-button">Add a task</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Backdrop className="dialog-backdrop" />
                  <Dialog.Popup className="dialog-popup">
                    <div className="dialog-shell">
                      <Dialog.Title className="dialog-title">Create a task</Dialog.Title>
                      <Dialog.Description className="dialog-description">
                        Add a short title and a compact description so the timer stays
                        readable.
                      </Dialog.Description>

                      <form className="task-form" onSubmit={handleCreateTask}>
                        <label className="task-field">
                          <span>Title</span>
                          <input
                            value={title}
                            onChange={(event) =>
                              setTitle(event.target.value.slice(0, TITLE_LIMIT))
                            }
                            maxLength={TITLE_LIMIT}
                            placeholder="Plan the next calm block"
                          />
                          <small className="field-meta">
                            {title.length}/{TITLE_LIMIT}
                          </small>
                        </label>
                        <label className="task-field">
                          <span>Detail</span>
                          <textarea
                            value={detail}
                            onChange={(event) =>
                              setDetail(event.target.value.slice(0, DETAIL_LIMIT))
                            }
                            maxLength={DETAIL_LIMIT}
                            placeholder="A short note for what done looks like."
                            rows={4}
                          />
                          <small className="field-meta">
                            {detail.length}/{DETAIL_LIMIT}
                          </small>
                        </label>
                        <div className="dialog-actions">
                          <Dialog.Close className="task-button task-button--ghost">
                            Cancel
                          </Dialog.Close>
                          <button type="submit" className="task-button">
                            Save task
                          </button>
                        </div>
                      </form>
                    </div>
                  </Dialog.Popup>
                </Dialog.Portal>
              </Dialog.Root>

              <p className="mini-note">
                Titles and descriptions are capped so the workspace stays compact.
              </p>
            </div>
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
                      <strong title={task.title}>{task.title}</strong>
                      <span title={task.detail}>{task.detail}</span>
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
          <div className="metric-chip">{estimatedQueueMinutes} min queued</div>
        </div>

        <ul className="clean-list task-list task-list--soft">
          {queuedTasks.length === 0 ? (
            <li className="empty-state">
              No active tasks yet. Use the button on the right to add one.
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
                            maxLength={TITLE_LIMIT}
                            onChange={(event) =>
                              setEditingTitle(event.target.value.slice(0, TITLE_LIMIT))
                            }
                          />
                          <textarea
                            className="task-inline-textarea"
                            value={editingDetail}
                            maxLength={DETAIL_LIMIT}
                            onChange={(event) =>
                              setEditingDetail(event.target.value.slice(0, DETAIL_LIMIT))
                            }
                            rows={2}
                          />
                          <small className="field-meta">
                            {editingTitle.length}/{TITLE_LIMIT} title,{" "}
                            {editingDetail.length}/{DETAIL_LIMIT} detail
                          </small>
                        </>
                      ) : (
                        <>
                          <strong title={task.title}>{task.title}</strong>
                          <span title={task.detail}>{task.detail}</span>
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
