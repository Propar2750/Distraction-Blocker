export const UNLOCK_MS = 15 * 60 * 1000;

export const CODES = {
  linkedin: 'vnLkl0O7RU8fT3ty51pl5Fpg60ugP4OwMcVKjEhFitVrAMJbewZa1WYFc4GpJ2nc',
  youtube:  '3A8uzIQDY9BybB0AawyLnKwYUMsS3wiI6PGkOUJ21J6cLgOgICeRLi4kBbJw0pMC',
};

export const BLOCKLIST = {
  instagram: { host: 'instagram.com', mode: 'redirect-newtab' },
  linkedin:  { host: 'linkedin.com',  mode: 'gate' },
  youtube:   { host: 'youtube.com',   mode: 'gate' },
};

export function matchSite(hostname) {
  for (const [site, { host }] of Object.entries(BLOCKLIST)) {
    if (hostname === host || hostname.endsWith('.' + host)) return site;
  }
  return null;
}
