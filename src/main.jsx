import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  buildBriefText,
  calculateHealth,
  EXAMPLE_SOURCES,
  formatDateLabel,
  getDateFromValue,
  getTodayValue,
  parseNotes,
  toDateValue
} from "./brief.js";
import "./styles.css";

const STORAGE_KEY = "mercury-brief-state";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({ selectedDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => getDateFromValue(selectedDate));
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const gridStart = new Date(viewYear, viewMonth, 1 - firstOfMonth.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });

  function moveMonth(offset) {
    setViewDate(new Date(viewYear, viewMonth + offset, 1));
  }

  return (
    <div className="calendar-popover" id="briefCalendar">
      <div className="calendar-head">
        <button type="button" className="calendar-nav" aria-label="Previous month" onClick={() => moveMonth(-1)}>
          {"‹"}
        </button>
        <strong>{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
        <button type="button" className="calendar-nav" aria-label="Next month" onClick={() => moveMonth(1)}>
          {"›"}
        </button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-grid" role="grid" aria-label="Generated update date calendar">
        {days.map((day) => {
          const dayValue = toDateValue(day);
          const classes = [
            "calendar-day",
            day.getMonth() !== viewMonth ? "is-muted" : "",
            dayValue === selectedDate ? "is-selected" : ""
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={dayValue}
              type="button"
              className={classes}
              role="gridcell"
              aria-label={formatDateLabel(dayValue)}
              aria-selected={dayValue === selectedDate}
              onClick={() => {
                onSelect(dayValue);
                onClose();
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function App() {
  const [projectName, setProjectName] = useState("");
  const [updateDate, setUpdateDate] = useState(getTodayValue());
  const [rawNotes, setRawNotes] = useState("");
  const [exampleSource, setExampleSource] = useState("meeting");
  const [copyStatus, setCopyStatus] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }
    try {
      const state = JSON.parse(saved);
      setProjectName(state.projectName || "");
      setUpdateDate(state.updateDate || getTodayValue());
      setRawNotes(state.rawNotes || "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projectName, rawNotes, updateDate }));
  }, [projectName, rawNotes, updateDate]);

  const brief = useMemo(() => parseNotes(rawNotes), [rawNotes]);
  const [health, healthDetail] = useMemo(() => calculateHealth(brief), [brief]);
  const generatedBriefText = useMemo(() => buildBriefText(projectName, brief, updateDate), [projectName, brief, updateDate]);
  const [briefText, setBriefText] = useState(generatedBriefText);

  useEffect(() => {
    setBriefText(generatedBriefText);
  }, [generatedBriefText]);

  function loadExample() {
    const example = EXAMPLE_SOURCES[exampleSource] || EXAMPLE_SOURCES.meeting;
    setProjectName(example.projectName);
    setRawNotes(example.notes);
    setCopyStatus("");
  }

  function clearBrief() {
    setProjectName("");
    setRawNotes("");
    setUpdateDate(getTodayValue());
    setCopyStatus("");
    localStorage.removeItem(STORAGE_KEY);
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(briefText);
    setCopyStatus("Brief copied.");
  }

  function renderList(items) {
    const visibleItems = items.length ? items : ["None captured"];
    return visibleItems.map((item) => <li key={item}>{item}</li>);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Mercury Brief</p>
          <h1>Turn scattered TPM notes into a crisp status update.</h1>
          <p className="lede">
            Paste standup, Slack, Jira, or meeting notes. Mercury groups the signal, drafts the brief, and keeps the
            latest snapshot in your browser.
          </p>
        </div>
        <div className="pulse-panel" aria-label="Brief health summary">
          <span className="pulse-label">Brief health</span>
          <strong>{health}</strong>
          <span>{healthDetail}</span>
        </div>
      </section>

      <section className="workspace" aria-label="Mercury Brief workspace">
        <form className="input-panel" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="projectName">Project</label>
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Payments launch, onboarding refresh, Q3 planning"
          />

          <label htmlFor="updateDate">Update date</label>
          <input
            id="updateDate"
            name="updateDate"
            type="date"
            value={updateDate}
            onChange={(event) => {
              setUpdateDate(event.target.value || getTodayValue());
              setCopyStatus("");
            }}
          />

          <label htmlFor="rawNotes">Source notes</label>
          <textarea
            id="rawNotes"
            name="rawNotes"
            rows="16"
            value={rawNotes}
            onChange={(event) => setRawNotes(event.target.value)}
            placeholder="Paste notes from Slack, standup, Jira, or meeting docs..."
          />

          <label htmlFor="exampleSource">Example source</label>
          <select id="exampleSource" name="exampleSource" value={exampleSource} onChange={(event) => setExampleSource(event.target.value)}>
            <option value="meeting">Meeting notes</option>
            <option value="jira">Jira updates</option>
            <option value="slackThread">Slack thread</option>
            <option value="chat">Team chat</option>
          </select>

          <div className="button-row">
            <button type="submit">Build brief</button>
            <button type="button" className="secondary" onClick={loadExample}>
              Load source
            </button>
            <button type="button" className="secondary" onClick={clearBrief}>
              Clear
            </button>
          </div>
        </form>

        <section className="brief-panel" aria-live="polite">
          <div className="brief-header">
            <div>
              <p className="eyebrow">Generated update</p>
              <h2>{projectName.trim() || "Daily TPM brief"}</h2>
              <div className="date-picker-wrap">
                <button
                  className="date-picker-pill"
                  type="button"
                  aria-expanded={isCalendarOpen}
                  aria-controls="briefCalendar"
                  onClick={() => setIsCalendarOpen((open) => !open)}
                >
                  <span>{formatDateLabel(updateDate)}</span>
                </button>
                {isCalendarOpen && (
                  <Calendar selectedDate={updateDate} onSelect={setUpdateDate} onClose={() => setIsCalendarOpen(false)} />
                )}
              </div>
            </div>
            <button type="button" onClick={copyBrief}>
              Copy
            </button>
          </div>

          <div className="summary-grid">
            <article className="category-updates">
              <h3>Updates</h3>
              <ul>{renderList(brief.updates)}</ul>
            </article>
            <article className="category-actions">
              <h3>Actions</h3>
              <ul>{renderList(brief.actions)}</ul>
            </article>
            <article className="category-risks">
              <h3>Risks</h3>
              <ul>{renderList(brief.risks)}</ul>
            </article>
            <article className="category-blockers">
              <h3>Blockers</h3>
              <ul>{renderList(brief.blockers)}</ul>
            </article>
            <article className="category-decisions">
              <h3>Decisions</h3>
              <ul>{renderList(brief.decisions)}</ul>
            </article>
          </div>

          <label htmlFor="briefOutput">Editable brief</label>
          <textarea id="briefOutput" rows="12" value={briefText} onChange={(event) => setBriefText(event.target.value)} />
          <p className="copy-status" role="status">
            {copyStatus}
          </p>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
