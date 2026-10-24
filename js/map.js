// Навигация по собственной карте: зум у указателя, перетаскивание и pinch.
export class AtlasMap {
  constructor(viewport) {
    this.viewport = viewport;
    this.scene = viewport.querySelector('.map');
    this.scale = 1;
    this.x = 0;
    this.y = 0;
    this.points = new Map();
    this.drag = null;
    this.suppressClick = false;
    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      this.zoom(this.scale * Math.exp(-event.deltaY * .0014), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    viewport.addEventListener('pointerdown', event => this.down(event));
    viewport.addEventListener('pointermove', event => this.move(event));
    viewport.addEventListener('pointerup', event => this.up(event));
    viewport.addEventListener('pointercancel', event => this.up(event));
    viewport.addEventListener('click', event => {
      if (this.suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); this.suppressClick = false; }
    }, true);
    viewport.addEventListener('keydown', event => this.key(event));
    viewport.addEventListener('focusin', event => {
      const marker = event.target.closest('.marker');
      if (!marker) return;
      const px = parseFloat(marker.style.left) / 100 * viewport.clientWidth * this.scale + this.x;
      const py = parseFloat(marker.style.top) / 100 * viewport.clientHeight * this.scale + this.y;
      if (px < 50 || px > viewport.clientWidth - 50 || py < 50 || py > viewport.clientHeight - 50) {
        this.x += viewport.clientWidth / 2 - px;
        this.y += viewport.clientHeight / 2 - py;
        this.render();
      }
    });
    document.getElementById('map-plus').addEventListener('click', () => this.zoom(this.scale * 1.25));
    document.getElementById('map-minus').addEventListener('click', () => this.zoom(this.scale / 1.25));
    document.getElementById('map-reset').addEventListener('click', () => this.reset());
    new ResizeObserver(() => this.render()).observe(viewport);
    this.render();
  }
  render() {
    const w = this.viewport.clientWidth, h = this.viewport.clientHeight;
    this.x = Math.max(w * (1 - this.scale), Math.min(0, this.x));
    this.y = Math.max(h * (1 - this.scale), Math.min(0, this.y));
    this.scene.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    document.getElementById('map-scale').textContent = `${Math.round(this.scale * 100)}%`;
    document.getElementById('map-plus').disabled = this.scale >= 3;
    document.getElementById('map-minus').disabled = this.scale <= 1;
  }
  zoom(scale, px = this.viewport.clientWidth / 2, py = this.viewport.clientHeight / 2) {
    const next = Math.max(1, Math.min(3, scale));
    this.x = px - (px - this.x) * next / this.scale;
    this.y = py - (py - this.y) * next / this.scale;
    this.scale = next;
    this.render();
  }
  reset() { this.scale = 1; this.x = 0; this.y = 0; this.render(); }
  down(event) {
    if (this.points.size === 0) this.suppressClick = false;
    if (event.button !== 0 || event.target.closest('.map-navigation')) return;
    this.points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.drag = { startX: event.clientX, startY: event.clientY, x: this.x, y: this.y };
    if (this.points.size === 2) this.pinch = this.pinchData();
  }
  pinchData() {
    const [a,b] = [...this.points.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  move(event) {
    if (!this.points.has(event.pointerId)) return;
    this.points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.points.size === 2) {
      const next = this.pinchData(), rect = this.viewport.getBoundingClientRect();
      if (this.pinch?.distance > 0) this.zoom(this.scale * next.distance / this.pinch.distance, next.x - rect.left, next.y - rect.top);
      this.pinch = next;
      this.suppressClick = true;
      return;
    }
    if (!this.drag) return;
    const dx = event.clientX - this.drag.startX, dy = event.clientY - this.drag.startY;
    if (Math.hypot(dx, dy) < 6 && !this.suppressClick) return;
    this.suppressClick = true;
    if (!this.viewport.hasPointerCapture(event.pointerId)) this.viewport.setPointerCapture(event.pointerId);
    this.viewport.classList.add('dragging');
    this.x = this.drag.x + dx; this.y = this.drag.y + dy; this.render();
  }
  up(event) {
    this.points.delete(event.pointerId);
    if (this.viewport.hasPointerCapture(event.pointerId)) this.viewport.releasePointerCapture(event.pointerId);
    this.viewport.classList.remove('dragging');
    this.drag = null; this.pinch = null;
    if (this.points.size === 1) {
      const point = [...this.points.values()][0];
      this.drag = { startX: point.x, startY: point.y, x: this.x, y: this.y };
    }
  }
  key(event) {
    if (['+', '=', '-', '−', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
    if (event.key === '+' || event.key === '=') this.zoom(this.scale * 1.2);
    else if (event.key === '-' || event.key === '−') this.zoom(this.scale / 1.2);
    else if (event.key === '0') this.reset();
    else if (event.key.startsWith('Arrow')) {
      this.x += event.key === 'ArrowLeft' ? 45 : event.key === 'ArrowRight' ? -45 : 0;
      this.y += event.key === 'ArrowUp' ? 45 : event.key === 'ArrowDown' ? -45 : 0;
      this.render();
    }
  }
}
