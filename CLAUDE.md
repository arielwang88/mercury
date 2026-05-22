# Mercury Project Notes

## Overview

Mercury is a small static TPM utility. The current app, Mercury Brief, turns
messy source notes into a structured daily status update.

The app has no build step and no backend. It is plain HTML, CSS, and JavaScript.

## Current App Behavior

- Users enter a project name, update date, and raw source notes.
- Users can load example notes from meeting notes, Jira updates, Slack threads,
  or team chats.
- Notes are classified into updates, actions, risks, blockers, and decisions by
  deterministic keyword rules in `app.js`.
- The generated brief is editable and can be copied.
- The left form date and right generated-panel date stay synced.
- The right generated-panel date uses a custom calendar popover instead of the
  browser-native date dropdown.
- The latest project, date, and notes persist in `localStorage`.

## Files

- `index.html`: App structure and controls.
- `styles.css`: Visual design, color-coded categories, and custom calendar
  styling.
- `app.js`: Parsing, classification, rendering, examples, date sync, calendar,
  and browser persistence.
- `tests/brief.test.js`: Node-based assertions for classification, examples, and
  date formatting.
- `package.json`: Defines `npm test`.

## Run Locally

Open `index.html` directly, or run a static file server:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173`.

## Validation

```bash
node tests/brief.test.js
```

If `npm` is available:

```bash
npm test
```

## Implementation Notes

- Keep the app dependency-free unless there is a strong reason to add tooling.
- Keep parsing deterministic for now; this avoids API keys and makes tests
  stable.
- When changing source examples, update tests so every selectable example still
  includes at least one update, action, risk, blocker, and decision.
- When changing date behavior, verify both the left form date and right-panel
  calendar stay synced and the editable brief includes the selected date.
