# Mercury

![Mercury Brief demo](assets/mercury-brief-demo.svg)

![Static app](https://img.shields.io/badge/app-static%20HTML%2FCSS%2FJS-2166A5)
![TPM workflow](https://img.shields.io/badge/workflow-TPM%20status%20briefs-13795B)
![No backend](https://img.shields.io/badge/backend-none-B83280)
![Tests](https://img.shields.io/badge/tests-node%20assertions-A16207)

Mercury is a lightweight workspace for practical TPM tools.

## Mercury Brief

Mercury Brief is a small static app that turns messy TPM source notes into a
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

Open `index.html` in a browser, or serve the folder with any static file server.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

In GitHub Codespaces, start the same server and open the forwarded `4173` port.

## Validate

```bash
npm test
```

The test uses mock TPM inputs from Slack, meetings, Jira, and team chats to
verify note classification and generated date formatting.
