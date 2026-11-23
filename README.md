# Desktop HQ — portfolio demo

**Live demo:** https://damianlapczynski.github.io/desktop-hq-demo/

Desktop HQ is my personal command centre: one screen that pulls together my calendar, inbox, tasks, morning brief, study projects, job search, budget and notes, with a 3D graph of my Obsidian vault (Nexus) as the start screen.

The real version is a local Node/Express app that talks to Google Calendar and Gmail over OAuth and reads and writes Markdown/JSON files in my Obsidian vault. **This repository is a static demo of that app:** the same frontend, with the backend replaced by an in-browser mock that serves fictional data. Nothing here touches real accounts, and every change you make is reset on reload. The UI language is Polish, as in my day-to-day version.

## What to try

- **Nexus** (start screen): the vault in 3D. The **Galaktyka** toggle shows it as a galaxy — every workstation is a star system, its notes are planets and moons, links between workstations are hyperspace lanes, with nebulae and invented outer worlds in between. Switch the toggle off for the plain force-directed graph. Click a note for its preview and AI summary.
- **Dziś** (Today): timeline of the day, next-event countdown, tasks due today, mail from real people only, weather. “✦ AI” markers jump to the AI scout card for that event.
- **Rozkazy** (Tasks): Eisenhower matrix. Tick a task and it moves to “done”.
- **Brief**: the generated morning brief (same layout as the real one) next to the **AI scout** — research cards for upcoming events with recommendations, warnings, sources and a live forecast for the place.
- **Werbunek** (Job search): job offers by track and tier, application queue, “mark as sent”, filter criteria.
- **Projekty**: Kanban board of study projects with drag-and-drop between columns.
- **Skarbiec** (Finance): budget vs. actual, upcoming payments, savings goals, quick expense entry.
- **Systemy**: health of data sources and a vault hygiene check.
- **J.A.R.V.I.S.**: the voice assistant's console — live state, background jobs, reminders, action log, notebook. Chat with it (or press J on any tab): it thinks, streams a reply, asks for a yes before any change and offers undo. In the demo every answer says it is only a demo.
- **Holoprojekcje**: board of content ideas moving from draft to recording to published.
- **Studio**: general ideas inbox and a film list with ratings and reviews.
- **Portfel**: investment tracker — contributions vs. the yearly tax-free limit, open and closed positions, broker export import.

The local version also has a strategy game played on the galaxy map; it is not part of this demo.

## How it is built

- Frontend: a single `index.html` (vanilla JS, no framework) plus `vendor/nexus3d.js`, a bundle of three.js + 3d-force-graph.
- Live backend (not in this repo): Node/Express, Google APIs (Calendar, Gmail), SQLite for the investment tracker, Claude API for summaries and the assistant.
- Demo: `demo-shim.js` intercepts `fetch('/api/…')` and returns generated data with dates relative to today.

All names, companies, e-mails, amounts and notes in this demo are fictional.
