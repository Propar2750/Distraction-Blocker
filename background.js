import { BLOCKLIST, UNLOCK_MS, matchSite } from './config.js';

const GATE_URL = chrome.runtime.getURL('gate.html');
const FOCUS_URL = chrome.runtime.getURL('focus.html');

async function isUnlocked(site) {
  const key = `unlock_${site}`;
  const data = await chrome.storage.local.get(key);
  const ts = data[key];
  return typeof ts === 'number' && Date.now() < ts + UNLOCK_MS;
}

async function handleNavigation({ tabId, url, frameId }) {
  if (frameId !== 0) return;
  if (!url || !url.startsWith('http')) return;

  let parsed;
  try { parsed = new URL(url); } catch { return; }

  const site = matchSite(parsed.hostname);
  if (!site) return;

  const { mode } = BLOCKLIST[site];

  if (mode === 'redirect-focus') {
    chrome.tabs.update(tabId, { url: FOCUS_URL });
    return;
  }

  if (mode === 'gate') {
    if (await isUnlocked(site)) return;
    const target = encodeURIComponent(url);
    chrome.tabs.update(tabId, {
      url: `${GATE_URL}?site=${site}&target=${target}`,
    });
  }
}

chrome.webNavigation.onBeforeNavigate.addListener(handleNavigation);
chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation);
