# Mercury

Mercury is a lightweight workspace for practical TPM tools.

## Mercury Brief

Mercury Brief is a small static app that turns messy TPM source notes into a
structured daily status update. Paste notes from Slack, standup, Jira, meeting
docs, or team chats, then generate an editable brief with updates, actions,
risks, blockers, and decisions.

## Features

- Selectable example sources for meeting notes, Jira updates, Slack threads, and
  team chats.
- Daily update date support with synced date controls in the input form and the
  generated update panel.
- Custom right-panel calendar popover for choosing the generated update date.
- Local browser persistence for the latest project, date, and source notes.
- Copyable/editable output ready for Slack, email, or status docs.
- Color-coded status sections for faster TPM scanning.

## Run locally

Open `index.html` in a browser, or serve the folder with any static file server.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Validate

```bash
npm test
```

The test uses mock TPM inputs from Slack, meetings, Jira, and team chats to
verify note classification and generated date formatting.
