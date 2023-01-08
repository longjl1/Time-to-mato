import { completedTasks, recentHistory, todoItems } from "@/lib/data";
import { TimerCard } from "@/components/timer-card";

export function DashboardView() {
  return (
    <main className="workspace">
      <div className="workspace-grid">
        <TimerCard />

        <aside className="stack">
          <section className="panel surface">
            <div className="section-head">
              <div>
                <p className="section-kicker">Done</p>
                <h2 className="section-title">Completed tasks</h2>
              </div>
              <div className="metric-chip">3 closed</div>
            </div>
            <ul className="clean-list task-list">
              {completedTasks.map((item) => (
                <li key={item}>
                  <span className="task-state task-state--done" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel surface">
            <div className="section-head">
              <div>
                <p className="section-kicker">Queue</p>
                <h2 className="section-title">Todo strip</h2>
              </div>
              <div className="metric-chip">4 waiting</div>
            </div>
            <ul className="clean-list task-list task-list--soft">
              {todoItems.map((item) => (
                <li key={item}>
                  <span className="task-state" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className="panel surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Recent</p>
            <h2 className="section-title">This week at a glance</h2>
            <p className="section-copy">
              A simple running record of finished blocks, carry-over, and total time.
            </p>
          </div>
          <div className="metric-chip">5 tracked days</div>
        </div>

        <div className="history-grid">
          {recentHistory.map((entry) => (
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
          ))}
        </div>
      </section>
    </main>
  );
}
