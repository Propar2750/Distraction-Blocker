// --- Clock ---
function tick() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clock').textContent =
    pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
tick();
setInterval(tick, 1000);

// --- Opportunity cost ticker ---
const start = Date.now();
const LOC_PER_SEC = 0.05;
const PAPER_PER_SEC = 0.00028;
const COMMIT_PER_SEC = 0.0028;

function updateCost() {
  const elapsed = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('cost-main').textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  document.getElementById('loc').textContent = Math.floor(elapsed * LOC_PER_SEC);
  document.getElementById('papers').textContent = (elapsed * PAPER_PER_SEC).toFixed(2);
  document.getElementById('commits').textContent = Math.floor(elapsed * COMMIT_PER_SEC);
}
updateCost();
setInterval(updateCost, 1000);

// --- Days left in year ---
(function () {
  const now = new Date();
  const eoy = new Date(now.getFullYear(), 11, 31);
  const days = Math.ceil((eoy - now) / (1000 * 60 * 60 * 24));
  document.getElementById('days21').textContent = days + 'd';
  document.querySelector('#days21').parentElement.querySelector('.k').textContent =
    'DAYS LEFT IN ' + now.getFullYear();
})();

// --- Quote rotator ---
const quotes = [
  ["The work you avoid is the work that would change everything.", "anon"],
  ["Compound interest applies to skill. You are currently not compounding.", "anon"],
  ["In five years you will either have done it or you will have a story about why you didn't.", "anon"],
  ["Discipline is choosing between what you want now and what you want most.", "abraham lincoln (misattributed, still true)"],
  ["The cost of a distraction is not the distraction. It's the depth you never reach.", "anon"],
  ["You don't rise to the level of your goals. You fall to the level of your systems.", "james clear"],
  ["The market doesn't care that you were tired.", "anon"],
  ["Every minute you spend here is a minute someone else is shipping.", "anon"],
  ["You already know what to do. That's what makes this painful.", "anon"],
  ["Intuition is built. You are not building it right now.", "anon"]
];
let qi = Math.floor(Math.random() * quotes.length);
function rotateQuote() {
  const q = document.getElementById('quote');
  const a = document.getElementById('quote-attr');
  q.style.opacity = 0;
  a.style.opacity = 0;
  setTimeout(() => {
    q.textContent = '"' + quotes[qi][0] + '"';
    a.textContent = '— ' + quotes[qi][1].toUpperCase();
    q.style.transition = 'opacity 0.4s';
    a.style.transition = 'opacity 0.4s';
    q.style.opacity = 1;
    a.style.opacity = 1;
    qi = (qi + 1) % quotes.length;
  }, 400);
}
rotateQuote();
setInterval(rotateQuote, 6000);

// --- Matrix rain ---
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
let cols, drops;
function sizeMatrix() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 14);
  drops = new Array(cols).fill(0).map(() => Math.random() * canvas.height);
}
sizeMatrix();
window.addEventListener('resize', sizeMatrix);

const chars = '01アイウエオカキクケコサシスセソabcdef{}[]<>=+-*/';
function drawMatrix() {
  ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#00ff41';
  ctx.font = '14px monospace';
  for (let i = 0; i < cols; i++) {
    const ch = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(ch, i * 14, drops[i]);
    if (drops[i] > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 14;
  }
}
setInterval(drawMatrix, 60);

// --- Glitch the headline occasionally ---
const headline = document.querySelector('.callout');
const origText = headline.innerHTML;
const glitchVariants = [
  'STOP.<br>YOU KNOW<br>WHY.',
  'ST0P.<br>Y0U KN0W<br>WHY.',
  'STOP.<br>BUILD<br>NOW.',
  'CL0SE<br>THIS<br>TAB.',
  'PARV.<br>STOP.<br>GO.'
];
setInterval(() => {
  if (Math.random() < 0.15) {
    const v = glitchVariants[Math.floor(Math.random() * glitchVariants.length)];
    headline.innerHTML = v;
    setTimeout(() => headline.innerHTML = origText, 180);
  }
}, 2200);

// --- Button handlers (inline handlers are blocked by MV3 CSP) ---
document.getElementById('close-btn').addEventListener('click', () => {
  // window.close() doesn't work for tabs the user navigated to themselves.
  // Use the chrome.tabs API instead.
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
    chrome.tabs.getCurrent((tab) => {
      if (tab && tab.id != null) {
        chrome.tabs.remove(tab.id);
      } else {
        window.close();
      }
    });
  } else {
    window.close();
  }
});

document.getElementById('reason-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('snooze').style.display = 'block';
});
