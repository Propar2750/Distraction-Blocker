import { CODES, BLOCKLIST } from './config.js';

const params = new URLSearchParams(location.search);
const site = params.get('site');
const target = params.get('target');

document.getElementById('site').textContent = site ?? '?';

const form = document.getElementById('form');
const input = document.getElementById('code');
const err = document.getElementById('err');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const expected = CODES[site];
  if (!expected) {
    err.textContent = 'Unknown site.';
    return;
  }
  if (input.value === expected) {
    await chrome.storage.local.set({ [`unlock_${site}`]: Date.now() });
    const fallback = `https://${BLOCKLIST[site].host}`;
    const dest = target ? decodeURIComponent(target) : fallback;
    location.replace(dest);
  } else {
    err.textContent = 'Incorrect code.';
    input.value = '';
    input.focus();
  }
});
