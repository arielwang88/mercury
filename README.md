# Mercury

![Mercury Brief demo](assets/mercury-brief-demo.svg)

![React app](https://img.shields.io/badge/app-React%20%2B%20Vite-2166A5)
![TPM workflow](https://img.shields.io/badge/workflow-TPM%20status%20briefs-13795B)
![No backend](https://img.shields.io/badge/backend-none-B83280)
![Tests](https://img.shields.io/badge/tests-node%20assertions-A16207)

Mercury is a lightweight workspace for practical TPM tools.

Try it out! [Link](https://mercury-eight-delta.vercel.app/)

## Mercury Brief

Mercury Brief is a small React + Vite app that turns messy TPM source notes into a
structured daily status update. Paste notes from Slack, standup, Jira, meeting
docs, or team chats, then generate an editable brief with updates, actions,
risks, blockers, and decisions.

## Demo Flow

1. Pick an example source: meeting notes, Jira updates, Slack thread, or team
   chat.
2. Choose the daily update date from the form or the generated-panel calendar.
3. Build the brief.
4. Review color-coded updates, actions, risks, blockers, and decisions.
5. Copy the editable summary into Slack, email, or a status doc.

## Features

- Selectable example sources for meeting notes, Jira updates, Slack threads, and
  team chats.
- Daily update date support with synced date controls in the input form and the
  generated update panel.
- Custom right-panel calendar popover for choosing the generated update date.
- Local browser persistence for the latest project, date, and source notes.
- Copyable/editable output ready for Slack, email, or status docs.
- Color-coded status sections for faster TPM scanning.

## Why It Helps

TPM updates often start as scattered fragments: a Jira ticket here, a Slack
reply there, a decision buried in meeting notes. Mercury Brief gives those
fragments a repeatable daily shape, so the final update is easier to scan,
share, and act on.

## Run locally

Install dependencies, then start the Vite dev server.

```bash
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

In GitHub Codespaces, open the forwarded Vite port after running `npm run dev`.

## Deploy on Vercel

Vercel can import this repository as a Vite app from GitHub.

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

After the GitHub repository is connected to Vercel, pushes, PRs, and merges can
produce automatic preview or production deployments.

## AI-Assisted Develop To Deploy

Mercury is designed for a lightweight cloud workflow where Codex changes the
GitHub repo, and Vercel handles public deployment from GitHub.

```text
Codex or Codespaces
  -> GitHub branch / PR
  -> Vercel preview deploy
  -> Merge to main
  -> Vercel production deploy
  -> Public URL
```

Codex does not need to connect directly to Vercel. The key integration is
GitHub to Vercel: import this repo in Vercel, keep the project connected to
`main`, and let Vercel build every PR, push, and merge.

This setup can stay close to zero cost for a personal project:

| Service | Role | Free-tier fit |
| --- | --- | --- |
| GitHub Codespaces | Cloud development environment | Monthly free hours for personal use |
| Vercel | Public web deployment | Hobby projects can deploy for free |
| GitHub | Repo, branches, and PRs | Free for public and private personal repos |
| ChatGPT Codex | AI code changes and PR support | Works through the GitHub repo |

## Validate

```bash
npm test
npm run build
```

The test uses mock TPM inputs from Slack, meetings, Jira, and team chats to
verify note classification and generated date formatting.
