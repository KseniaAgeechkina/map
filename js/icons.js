// Три небольших герба: сияние, руины и дракон. Это собственные SVG, без шрифтовых иконок.
const paths = {
  aurora: '<path d="M5 19c5-14 7 7 12-8s5 5 10-5M5 25c5-13 8 6 13-6s5 3 9-1"/><path d="m21 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
  ruins: '<path d="M5 28h22M8 28V10l6-5 4 5 6-2v20M12 28V17a4 4 0 0 1 8 0v11M8 12h5m7-1h4M12 5l2 5-3 4"/>',
  dragons: '<path d="m6 22 4-5 6 1 4-6 5-2 3 3-5 1-2 5-5 4-6 1-4 4M16 18 9 5l-4 7 5 2-2 5m10-3 3-12 5 4-4 3m-9 12-1 5m8-9 5 4"/>'
};
export function missionIcon(id) {
  return `<svg class="mission-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id] || paths.aurora}</svg>`;
}
