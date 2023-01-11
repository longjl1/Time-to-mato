"use client";

import { Tabs } from "@base-ui-components/react";
import { archivedTracks, monthGrid, recentHistory } from "@/lib/data";

export function HistoryView() {
  return (
    <main className="workspace">
      <section className="panel panel-strong surface">
        <div className="section-head">
          <div>
            <p className="section-kicker">Navigation</p>
            <h2 className="section-title">Calendar, logs, and archived tracks</h2>
            <p className="section-copy">
              The history surface stays monochrome and compact so patterns are easy to
              read at a glance.
            </p>
          </div>
          <div className="metric-chip">Year view</div>
        </div>

        <Tabs.Root defaultValue="calendar" className="tabs-root">
          <Tabs.List className="tabs-list">
            <Tabs.Tab className="tabs-tab" value="calendar">
              Calendar
            </Tabs.Tab>
            <Tabs.Tab className="tabs-tab" value="log">
              Log
            </Tabs.Tab>
            <Tabs.Tab className="tabs-tab" value="archive">
              Archive
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel className="tabs-panel" value="calendar">
            <div className="calendar-surface">
              <div className="calendar-grid">
                {monthGrid.map((value, index) => (
                  <span
                    key={`${value}-${index}`}
                    className="calendar-cell"
                    data-level={value}
                  />
                ))}
              </div>
              <div className="calendar-copy">
                <h3>December rhythm</h3>
                <p className="mini-note">
                  Darker cells mark denser focus days. Light cells are resets, admin,
                  or days left intentionally open.
                </p>
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel className="tabs-panel" value="log">
            <div className="history-grid">
              {recentHistory.map((entry) => (
                <article key={`${entry.date}-log`} className="history-row">
                  <div>
                    <p className="history-day">
                      {entry.day} <span>{entry.date}</span>
                    </p>
                    <p className="mini-note">{entry.total}</p>
                  </div>
                  <div className="history-meta">
                    <span>{entry.done} completed tasks</span>
                    <span>{entry.carry} carried forward</span>
                  </div>
                </article>
              ))}
            </div>
          </Tabs.Panel>

          <Tabs.Panel className="tabs-panel" value="archive">
            <ul className="clean-list archive-list">
              {archivedTracks.map((track) => (
                <li key={track}>
                  <strong>{track}</strong>
                  <span className="mini-note">Closed and preserved for reference.</span>
                </li>
              ))}
            </ul>
          </Tabs.Panel>
        </Tabs.Root>
      </section>
    </main>
  );
}
