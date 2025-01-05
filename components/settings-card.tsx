"use client";

import { Switch } from "@base-ui-components/react";
import type { FocusSettings } from "@/lib/focus-store";

type SettingsCardProps = {
  settings: FocusSettings;
  completedToday: number;
  estimatedQueueMinutes: number;
  onUpdateSettings: (patch: Partial<FocusSettings>) => void;
};

export function SettingsCard({
  settings,
  completedToday,
  estimatedQueueMinutes,
  onUpdateSettings,
}: SettingsCardProps) {
  return (
    <section className="panel surface">
      <div className="section-head">
        <div>
          <p className="section-kicker">Settings</p>
          <h2 className="section-title">Focus controls</h2>
          <p className="section-copy">
            Adjust your rhythm without leaving the dashboard.
          </p>
        </div>
        <div className="metric-chip">{completedToday}/{settings.dailyGoal} today</div>
      </div>

      <div className="settings-grid">
        <div className="focus-toggle">
          <div>
            <p className="section-kicker">Theme</p>
            <h3>Night mode</h3>
          </div>
          <Switch.Root
            checked={settings.darkMode}
            onCheckedChange={(checked) => onUpdateSettings({ darkMode: checked })}
            className="switch-root"
          >
            <Switch.Thumb className="switch-thumb" />
          </Switch.Root>
        </div>

        <label className="task-field">
          <span>Focus minutes</span>
          <input
            type="range"
            min={10}
            max={90}
            step={5}
            value={settings.focusMinutes}
            onChange={(event) =>
              onUpdateSettings({ focusMinutes: Number(event.target.value) })
            }
          />
          <strong className="setting-readout">{settings.focusMinutes} min</strong>
        </label>

        <label className="task-field">
          <span>Break minutes</span>
          <input
            type="range"
            min={3}
            max={30}
            step={1}
            value={settings.breakMinutes}
            onChange={(event) =>
              onUpdateSettings({ breakMinutes: Number(event.target.value) })
            }
          />
          <strong className="setting-readout">{settings.breakMinutes} min</strong>
        </label>

        <label className="task-field">
          <span>Daily goal</span>
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={settings.dailyGoal}
            onChange={(event) =>
              onUpdateSettings({ dailyGoal: Number(event.target.value) })
            }
          />
          <strong className="setting-readout">{settings.dailyGoal} sessions</strong>
        </label>
      </div>

      <div className="settings-summary">
        <div>
          <span className="section-kicker">Queue</span>
          <strong>{estimatedQueueMinutes} min planned</strong>
        </div>
        <div>
          <span className="section-kicker">Cadence</span>
          <strong>
            {settings.focusMinutes}/{settings.breakMinutes}
          </strong>
        </div>
      </div>
    </section>
  );
}
