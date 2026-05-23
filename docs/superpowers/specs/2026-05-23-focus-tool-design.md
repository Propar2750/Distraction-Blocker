# Focus Tool — Chrome Extension Design

**Date:** 2026-05-23
**Status:** Approved

## Purpose

A personal Chrome extension that adds friction (or a hard block) to distracting sites:

- **Instagram** — hard block. Any navigation to `instagram.com` is redirected to the new tab page.
- **LinkedIn** and **YouTube** — gated. The user must paste a long hardcoded code to unlock the site for 15 minutes. Each site has its own code and its own independent unlock timer.

The codes are stored as plain string constants in the extension's source. Retrieving them requires opening the repository on disk and reading the file — friction by design.

## Architecture

Chrome Manifest V3 extension with three components:

1. **Background service worker** (`background.js`) — registered in `manifest.json`. Listens to `chrome.webNavigation.onBeforeNavigate` and `chrome.webNavigation.onHistoryStateUpdated`. For each navigation, it inspects the URL's hostname and routes:
   - Instagram → redirect tab to `chrome://newtab/`.
   - LinkedIn / YouTube → check `chrome.storage.local` for a current unlock; if expired or absent, redirect tab to the extension's gate page with the original URL as a query parameter.
   - Anything else → ignore.

2. **Gate page** (`gate.html` + `gate.js`) — a static HTML page bundled with the extension. It reads `site` and `target` query parameters, prompts the user for the site's code, validates against the constant in `config.js`, and on success writes `unlock_<site> = Date.now()` to `chrome.storage.local` and redirects the tab to `target`. On failure it shows an error and stays on the gate.

3. **Config module** (`config.js`) — exports `CODES` (per-site long strings), `BLOCKLIST` (host matching rules), and `UNLOCK_MS` (15 * 60 * 1000). This is the file the user must open to retrieve a code.

State lives in `chrome.storage.local` under keys `unlock_linkedin` and `unlock_youtube` (numeric millisecond timestamps).

## Behavior

### Instagram (hard block)

Any navigation whose hostname matches `instagram.com` or `*.instagram.com` (any path, any subdomain) triggers `chrome.tabs.update(tabId, { url: 'chrome://newtab/' })`. No prompt, no gate.

### LinkedIn / YouTube (code gate)

On navigation to `linkedin.com`/`*.linkedin.com` or `youtube.com`/`*.youtube.com`:

1. Background reads `unlock_<site>` from `chrome.storage.local`.
2. If `Date.now() < unlock_<site> + UNLOCK_MS`, allow navigation (do nothing).
3. Otherwise redirect the tab to `chrome-extension://<id>/gate.html?site=<site>&target=<encodeURIComponent(originalUrl)>`.
4. The gate page renders a single password-style input and a submit button. On submit, it compares the input to `CODES[site]`:
   - **Match** → write `unlock_<site> = Date.now()` and `window.location.replace(decodeURIComponent(target))`.
   - **No match** → show "Incorrect code" inline, clear the input.

Per-site timers and per-site codes mean unlocking LinkedIn does not unlock YouTube and vice versa.

### SPA navigation

Sites like YouTube and LinkedIn perform client-side route changes that don't trigger a full page load. The background listens to both `onBeforeNavigate` (full loads) and `onHistoryStateUpdated` (SPA route changes). Within an active unlock window, both pass freely; once the window expires, the next SPA route change will redirect to the gate.

## File Layout

```
focus-tool/
  manifest.json
  background.js       # webNavigation listener + routing logic
  config.js           # CODES, BLOCKLIST, UNLOCK_MS  ← codes live here
  gate.html           # input form
  gate.js             # validates code, writes storage, redirects
  icon.png            # extension icon (single size is fine for personal use)
```

## Config Module Shape

```js
// config.js
export const UNLOCK_MS = 15 * 60 * 1000;

export const CODES = {
  linkedin: '<long random string A>',
  youtube:  '<long random string B>',
};

export const BLOCKLIST = {
  instagram: { hosts: ['instagram.com'], mode: 'redirect-newtab' },
  linkedin:  { hosts: ['linkedin.com'],  mode: 'gate' },
  youtube:   { hosts: ['youtube.com'],   mode: 'gate' },
};
```

Host matching: a navigation matches a site if its hostname equals one of the listed hosts OR ends with `.` + that host (covers subdomains like `www.`, `m.`, `studio.youtube.com`).

## Manifest Permissions

- `webNavigation` — to intercept navigations.
- `tabs` — to call `chrome.tabs.update`.
- `storage` — for unlock timestamps.
- `host_permissions`: `*://*.instagram.com/*`, `*://*.linkedin.com/*`, `*://*.youtube.com/*`.

## Edge Cases

- **Direct URL typed, link clicked, bookmark opened** — all flow through `onBeforeNavigate`, handled identically.
- **Tabs already open at install time** — not handled retroactively; next navigation in those tabs will be intercepted.
- **Gate page reloaded** — `site` and `target` come from the query string, so reload is idempotent.
- **`target` missing or malformed** — gate falls back to redirecting to `https://<site>.com` on success.
- **Extension disabled by user** — not prevented; this is a self-imposed friction tool, not a parental control.

## Out of Scope (YAGNI)

- Options UI, enable/disable toggle, statistics, sync across devices.
- Allowlist for specific YouTube channels or LinkedIn profiles.
- Notifications, timers visible in UI, snooze.
- Obfuscation of the codes beyond "they're in a source file you have to open."

## Success Criteria

- Navigating to any Instagram URL lands on the new tab page within one redirect.
- Navigating to LinkedIn or YouTube without an active unlock lands on the gate page; entering the correct code lands on the originally requested URL.
- An entered code unlocks only that one site, and only for 15 minutes.
- The codes are visible in `config.js` and nowhere else.
