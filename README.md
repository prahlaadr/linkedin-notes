# LinkedIn Notes

A free, open-source Chrome extension that lets you add private notes and tags to any LinkedIn profile. Your personal memory layer for professional networking.

## Why?

LinkedIn has no way to remember *how* you met someone or *what* you talked about. Paid tools like LeadDelta and Surfe solve this, but they're expensive, sales-focused, and send your data to their cloud.

LinkedIn Notes is different:
- **100% local** — your notes never leave your browser
- **Free & open source** — MIT licensed, no account needed
- **Personal, not sales** — designed for remembering people, not managing leads

## Features

- **Notes overlay** — click the note icon on any LinkedIn profile to open a centered modal with your notes
- **Tags** — add colored tags (e.g. "met-at-conference", "follow-up") with autocomplete from existing tags
- **Auto-save** — notes save automatically as you type
- **Badge indicator** — profiles with notes show a subtle icon so you know at a glance
- **Search & browse** — use the extension popup to search across all your notes, names, and tags
- **Tag filtering** — filter profiles by tag in the popup
- **Export** — download all your notes as JSON for backup
- **Dark mode** — respects LinkedIn's theme

## Install

### From source (developer mode)

1. Clone this repo
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build the extension:
   ```bash
   bun run build
   ```
4. Open Chrome → `chrome://extensions/`
5. Enable "Developer mode" (top right)
6. Click "Load unpacked" → select the `.output/chrome-mv3` folder

### Development

```bash
bun run dev
```

This starts WXT in dev mode with hot reload. The extension will auto-load in Chrome.

## How it works

1. Visit any LinkedIn profile (`linkedin.com/in/...`)
2. You'll see a small note icon near the profile name
3. Click it → a modal overlay appears
4. Write your notes, add tags
5. Close the modal (click outside or press Esc) — everything auto-saves
6. Click the extension icon in the toolbar to search/browse all your notes

## Tech stack

- [WXT](https://wxt.dev/) — next-gen browser extension framework
- [React 19](https://react.dev/) — UI components
- TypeScript
- Chrome Storage API — local persistence
- Manifest V3

## Data & privacy

- All data stored locally in Chrome via `chrome.storage.local`
- No external API calls, no analytics, no tracking
- Your notes never leave your browser
- Export your data anytime as JSON

## Roadmap

- [ ] Notion sync (bidirectional)
- [ ] Import/export CSV
- [ ] Note templates
- [ ] Reminder system ("follow up in 2 weeks")
- [ ] Chrome Web Store listing
- [ ] Firefox support
- [ ] Markdown rendering in notes

## License

MIT
