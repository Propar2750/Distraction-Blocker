# Distraction Blocker

Distraction Blocker is a personal Chrome extension that puts friction between you and the sites you waste time on. Instagram is redirected to a blank new tab on every visit. LinkedIn and YouTube are gated behind long codes stored as plain constants in `config.js` — to unlock either site for 15 minutes, you have to open the repo, open the file, and copy the code out. Each site has its own code and its own timer. The point isn't to make distraction impossible; it's to make it annoying enough that you don't do it on autopilot.

## Install

1. Open `chrome://extensions`.
2. Toggle **Developer mode** on (top right).
3. Click **Load unpacked** and select this folder.

## Where the codes live

`config.js` — the `CODES` object. To unlock a site you have to open this folder, open `config.js`, and read the value. That's the friction.

## Tuning

- `UNLOCK_MS` in `config.js` controls how long an unlock lasts.
- Add or remove sites in `BLOCKLIST`. `mode: 'redirect-newtab'` hard-blocks; `mode: 'gate'` requires a code.

## Reset an unlock manually

Open the extension's service worker console (`chrome://extensions` → "service worker" link) and run:

```js
chrome.storage.local.clear()
```
