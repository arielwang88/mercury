# Mercury Project Notes

## Overview

Mercury is a small React + Vite TPM utility. The current app, Mercury Brief, turns
messy source notes into a structured daily status update.

The app has no backend. Vite builds the static production output into `dist/`.

## Current App Behavior

- Users enter a project name, update date, and raw source notes.
- Users can load example notes from meeting notes, Jira updates, Slack threads,
  or team chats.
- Notes are classified into updates, actions, risks, blockers, and decisions by
  deterministic keyword rules in `src/brief.js`.
- The generated brief is editable and can be copied.
- The left form date and right generated-panel date stay synced.
- The right generated-panel date uses a custom calendar popover instead of the
  browser-native date dropdown.
- The latest project, date, and notes persist in `localStorage`.

## Files

- `index.html`: App structure and controls.
- `src/main.jsx`: React UI, date sync, custom calendar, and browser persistence.
- `src/brief.js`: Parsing, classification, examples, date formatting, and brief
  generation helpers.
- `src/styles.css`: Visual design, color-coded categories, and custom calendar
  styling.
- `tests/brief.test.js`: Node-based assertions for classification, examples, and
  date formatting.
- `vite.config.js`: Vite React configuration.
- `package.json`: Defines `npm run dev`, `npm run build`, `npm run preview`, and
  `npm test`.

## Run Locally

Install dependencies and run the Vite dev server:

```bash
npm install
npm run dev
```

In Codespaces, open the forwarded Vite port.

## Develop-Deploy Architecture

Use GitHub as the source of truth and Vercel as the deployment system. AI coding
agents should update the repository through branches and pull requests, then let
the GitHub to Vercel integration produce previews and production deploys.

```text
Codex or Codespaces
  -> GitHub branch / PR
  -> Vercel preview deploy
  -> Merge to main
  -> Vercel production deploy
  -> Public URL
```

Codex does not need a direct Vercel connection for normal development. The
required deployment connection is GitHub to Vercel:

- Import `arielwang88/mercury` into Vercel.
- Use the Vite framework preset.
- Build with `npm run build`.
- Deploy the `dist` output directory.
- Let Vercel create preview deployments for PRs and production deployments for
  merges to `main`.

The intended low-cost stack is GitHub Codespaces for cloud development, GitHub
for repo and PR workflow, Vercel Hobby for public hosting, and Codex for
AI-assisted code changes.

## Validation

```bash
node tests/brief.test.js
```

If `npm` is available:

```bash
npm test
npm run build
```

## Implementation Notes

- Keep runtime dependencies minimal; this should stay a simple React + Vite app.
- Keep parsing deterministic for now; this avoids API keys and makes tests
  stable.
- When changing source examples, update tests so every selectable example still
  includes at least one update, action, risk, blocker, and decision.
- When changing date behavior, verify both the left form date and right-panel
  calendar stay synced and the editable brief includes the selected date.
