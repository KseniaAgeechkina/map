// Эффекты не влияют на брони. Их можно отключить, а список всегда доступен.
export class WorldController {
  constructor(store) {
    this.store = store;
    this.map = document.getElementById('map');
    this.fog = document.getElementById('fog-toggle');
    this.frame = 0;
    this.point = { x: 50, y: 50 };
    if (matchMedia('(hover: none)').matches) this.store.fog = false;
    document.querySelectorAll('.world-switch button').forEach(button => {
      button.addEventListener('click', () => { store.setWorld(button.dataset.world); this.render(); });
    });
    this.fog.addEventListener('click', () => { store.setFog(!store.fog); this.render(); });
    this.map.addEventListener('pointermove', event => {
      const rect = this.map.getBoundingClientRect();
      this.reveal((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100);
    }, { passive: true });
    this.map.addEventListener('focusin', event => {
      const marker = event.target.closest('.marker');
      if (marker) this.reveal(parseFloat(marker.style.left), parseFloat(marker.style.top));
    });
    this.render();
  }

  reveal(x, y) {
    this.point = { x, y };
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.map.style.setProperty('--reveal-x', `${this.point.x}%`);
      this.map.style.setProperty('--reveal-y', `${this.point.y}%`);
      this.frame = 0;
    });
  }

  render() {
    document.body.dataset.world = this.store.world;
    this.map.classList.toggle('fog-off', !this.store.fog);
    this.fog.setAttribute('aria-pressed', String(this.store.fog));
    this.fog.textContent = `Туман: ${this.store.fog ? 'включён' : 'выключен'}`;
    document.querySelectorAll('.world-switch button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.world === this.store.world)));
    document.getElementById('world-status').textContent = this.store.world === 'night'
      ? 'Долгая ночь · огни дозора зажжены'
      : 'Северный день · тропы открыты';
  }
}
