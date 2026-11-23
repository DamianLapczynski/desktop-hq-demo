# Desktop HQ — portfolio demo

**Live demo:** https://damianlapczynski.github.io/desktop-hq-demo/

Desktop HQ is my personal command centre: one screen that pulls together my calendar, inbox, tasks, morning brief, study projects, job search, budget and notes, with a 3D graph of my Obsidian vault (Nexus) as the start screen.

The real version is a local Node/Express app that talks to Google Calendar and Gmail over OAuth and reads and writes Markdown/JSON files in my Obsidian vault. **This repository is a static demo of that app:** the same frontend, with the backend replaced by an in-browser mock that serves fictional data. Nothing here touches real accounts, and every change you make is reset on reload. The UI language is Polish, as in my day-to-day version.

## What to try

- **Nexus** (start screen): 3D force-directed graph of the vault, with note previews, hubs and AI summaries.
- **Dziś** (Today): timeline of the day, next event countdown, mail from real people only, weather.
- **Rozkazy** (Tasks): Eisenhower matrix. Tick a task and it moves to “done”.
- **Brief**: the generated morning brief, embedded.
- **Werbunek** (Job search): tiered job offers, application queue and tracking.
- **Projekty**: Kanban board of study projects with drag-and-drop between columns.
- **Skarbiec** (Finance): budget vs. actual, upcoming payments, savings goals, quick expense entry.
- **Systemy**: health of data sources and a vault hygiene check.
- **J.A.R.V.I.S.**: chat panel to an AI assistant. In the demo it replies with a canned message.

## How it is built

- Frontend: a single `index.html` (vanilla JS, no framework) plus `vendor/nexus3d.js`, a bundle of three.js + 3d-force-graph.
- Live backend (not in this repo): Node/Express, Google APIs (Calendar, Gmail), SQLite for the investment tracker, Claude API for summaries and the assistant.
- Demo: `demo-shim.js` intercepts `fetch('/api/…')` and returns generated data with dates relative to today.

All names, companies, e-mails, amounts and notes in this demo are fictional.
