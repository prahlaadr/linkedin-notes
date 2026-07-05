# LinkedIn Notes

A free, open-source Chrome extension that adds private notes and tags to LinkedIn profiles. Remember how you met someone, what you talked about, and what to follow up on — all stored locally in your browser.

## Why?

LinkedIn has no way to remember context about the people in your network. Paid tools like LeadDelta ($29/mo) and Surfe solve this, but they're expensive, sales-focused, and send your data to their servers.

LinkedIn Notes is different:

- **100% local** — your notes never leave your browser
- **Free & open source** — MIT licensed, no account needed
- **Personal, not sales** — designed for remembering people, not managing leads
- **Lightweight** — under 500KB, no external dependencies

## Features

### On LinkedIn profiles
- **Note icon** — a small 📝 badge appears next to the profile name on every LinkedIn profile
- **Notes overlay** — click the icon to open a centered modal where you write notes about the person
- **Tags** — add colored tags like `met-at-conference`, `follow-up`, `mentor` with autocomplete from your existing tags
- **Auto-save** — notes save automatically as you type (500ms debounce)
- **Badge indicator** — the icon lights up on profiles where you already have notes

### Dashboard (CRM view)
- **Full-page dashboard** — a dedicated page showing all your annotated profiles in a table
- **Search** — search across names, notes, and tags
- **Tag filtering** — click tags to filter, multi-select supported
- **Expandable rows** — click any row to see the full note text
- **Delete** — remove notes for any profile
- **Export** — download all your data as JSON

### Quick popup
- **Toolbar popup** — click the extension icon for a quick search across all your notes
- **Open Dashboard** — link at the bottom to open the full CRM page

## Install

### Chrome Web Store (easiest)

Install directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/pmgnbdcfngpajpphdegkepjlfkbjgbhn) and click **Add to Chrome**. Works in Chrome, Brave, Edge, and Arc. Then visit any LinkedIn profile and click the 📝 icon next to the person's name.

### Download (no coding required)

Go to the [latest release](https://github.com/prahlaadr/linkedin-notes/releases/latest) and download the zip for your browser:

**Chrome / Brave / Edge / Arc:**
1. Download `linkedin-notes-v1.0.0-chrome.zip` and unzip it
2. Open `chrome://extensions/` → enable **Developer mode** (top right)
3. Click **Load unpacked** → select the `chrome-mv3` folder

**Firefox / Zen Browser:**
1. Download `linkedin-notes-v1.0.0-firefox.zip` and unzip it
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** → select any file inside the `firefox-mv2` folder

Then visit any LinkedIn profile and click the 📝 icon next to the person's name.

### From source

```bash
git clone https://github.com/prahlaadr/linkedin-notes.git
cd linkedin-notes
npm install
```

> Also works with `bun install`, `pnpm install`, or `yarn install`.

#### Option 1: Dev mode (recommended for trying it out)

```bash
npm run dev
```

This starts WXT in dev mode — it opens a Chrome window with the extension already loaded and hot reload enabled.

#### Option 2: Production build

```bash
npm run build
```

Then load manually:
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3` folder

## How it works

```
Visit a LinkedIn profile
        │
        ▼
   📝 icon appears next to the person's name
        │
        ▼
   Click it → overlay modal opens
        │
        ├── Write notes (auto-saves)
        ├── Add/remove tags (with autocomplete)
        └── Press Esc or click outside to close
        │
        ▼
   Click extension icon in toolbar
        │
        ├── Quick search popup
        └── "Open Dashboard" → full CRM page with table,
            filters, search, and export
```

## Data model

Each profile note is stored as a separate entry in Chrome's local storage:

```typescript
interface ProfileNote {
  profileId: string       // URL slug (e.g. "john-doe-12345")
  profileName: string     // Display name
  profileUrl: string      // Full LinkedIn URL
  profileImageUrl?: string
  notes: string           // Freeform text
  tags: string[]          // e.g. ["met-at-react-conf", "follow-up"]
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp
}
```

A lightweight index is maintained separately for fast search without loading all notes.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [WXT](https://wxt.dev/) (next-gen browser extension framework) |
| UI | [React 19](https://react.dev/) |
| Language | TypeScript |
| Storage | Chrome Storage API (`chrome.storage.local`) |
| Manifest | V3 |
| Build | Vite (via WXT) |

## Project structure

```
linkedin-notes/
├── entrypoints/
│   ├── content/              # Injected into LinkedIn pages
│   │   ├── index.tsx         # Profile detection, badge injection
│   │   ├── badge.ts          # Note icon component
│   │   └── components/
│   │       ├── NotesOverlay.tsx  # Modal overlay
│   │       └── TagChips.tsx     # Tag input + autocomplete
│   ├── popup/                # Toolbar popup (quick search)
│   │   ├── App.tsx
│   │   └── style.css
│   ├── dashboard/            # Full-page CRM dashboard
│   │   ├── Dashboard.tsx
│   │   └── style.css
│   └── background.ts        # Service worker
├── lib/
│   ├── storage.ts            # Chrome storage wrapper + index
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # URL parsing, debounce, tag colors
├── wxt.config.ts
└── package.json
```

## Privacy

- All data stored locally via `chrome.storage.local` (~10MB limit, enough for thousands of profiles)
- Zero external API calls
- Zero analytics or tracking
- Zero server infrastructure
- Your notes never leave your browser
- Export your data anytime as JSON backup

## Roadmap

- [ ] Notion sync (bidirectional — backup + access across devices)
- [ ] Import/export CSV
- [ ] Note templates ("Met at: ___", "Follow up about: ___")
- [ ] Reminder system ("follow up in 2 weeks")
- [x] Chrome Web Store listing
- [x] Firefox / Zen Browser support
- [ ] Markdown rendering in notes
- [ ] Edit notes from the dashboard

## Contributing

PRs welcome. The codebase is small and straightforward — see the project structure above.

```bash
npm run dev        # dev mode with hot reload
npm run build      # production build
npm run compile    # type check
```

## License

MIT
