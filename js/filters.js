// Выпадающий фильтр со своим оформлением и клавиатурным управлением.
export class CustomFilter {
  constructor(root) {
    this.root = root;
    this.button = root.querySelector('.filter-trigger');
    this.list = root.querySelector('[role="listbox"]');
    this.options = [...this.list.querySelectorAll('[role="option"]')];
    this.defaultValue = this.button.value;
    root.addEventListener('click', event => {
      if (event.target.closest('.filter-trigger')) this.toggle();
      const option = event.target.closest('[role="option"]');
      if (option) this.choose(option.dataset.value);
    });
    root.addEventListener('keydown', event => this.keydown(event));
    document.addEventListener('click', event => { if (!root.contains(event.target)) this.close(); });
    root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) this.close(); });
    root.closest('form').addEventListener('reset', () => this.choose(this.defaultValue, false));
    this.choose(this.defaultValue, false);
  }
  toggle() {
    if (!this.list.hidden) return this.close();
    this.list.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.options.find(option => option.dataset.value === this.button.value)?.focus();
  }
  close() {
    this.list.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
  }
  choose(value, emit = true) {
    const option = this.options.find(item => item.dataset.value === value);
    if (!option) return;
    this.button.value = value;
    this.button.querySelector('.filter-value').textContent = option.textContent.trim();
    this.options.forEach(item => item.setAttribute('aria-selected', String(item === option)));
    this.close();
    if (emit) {
      this.button.focus();
      this.button.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  keydown(event) {
    if (event.key === 'Escape') {
      if (this.list.hidden) return;
      event.preventDefault(); event.stopPropagation(); this.close(); this.button.focus();
      return;
    }
    const current = this.options.indexOf(document.activeElement);
    let next;
    if (event.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % this.options.length;
    else if (event.key === 'ArrowUp') next = current < 0 ? this.options.length - 1 : (current - 1 + this.options.length) % this.options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.options.length - 1;
    else return;
    event.preventDefault();
    this.list.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.options[next].focus();
  }
}
