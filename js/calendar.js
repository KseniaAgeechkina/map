// Работа с календарными днями без сдвигов из-за UTC и переходов времени.
export function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const todayISO = () => toISO(new Date());
export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toISO(date) === value ? date : null;
}
export function addDays(value, days) {
  const date = parseDate(value);
  if (!date || !Number.isInteger(days)) return null;
  date.setDate(date.getDate() + days);
  return toISO(date);
}
export function validArrival(value) {
  return Boolean(parseDate(value)) && value >= todayISO() && value <= addDays(todayISO(), 365);
}
export function formatDate(value) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'Дата не указана';
}

export function nightsBetween(start, end) {
  const a = parseDate(start), b = parseDate(end);
  return a && b ? Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000) : 0;
}

export class ArrivalCalendar {
  constructor(root, onChange) {
    this.root = root;
    this.onChange = onChange;
    this.value = todayISO();
    this.endDate = addDays(this.value, 1);
    this.selecting = 'start';
    this.month = parseDate(this.value);
    this.month.setDate(1);
    this.open = false;
    root.innerHTML = `<div class="date-range-fields"><button type="button" class="calendar-trigger" data-boundary="start" aria-expanded="false" aria-controls="arrival-panel"><span class="date-caption">Заезд</span><span class="date-value"></span><span class="date-glyph" aria-hidden="true">↗</span></button><button type="button" class="calendar-trigger" data-boundary="end" aria-expanded="false" aria-controls="arrival-panel"><span class="date-caption">Выезд</span><span class="date-value"></span><span class="date-glyph" aria-hidden="true">↗</span></button></div><div id="arrival-panel" class="calendar-panel" hidden></div><p class="departure-note" aria-live="polite"></p>`;
    this.panel = root.querySelector('.calendar-panel');
    root.addEventListener('click', event => this.click(event));
    root.addEventListener('keydown', event => this.keydown(event));
    this.render();
  }

  get nights() { return nightsBetween(this.value, this.endDate); }

  available(value) {
    if (this.selecting === 'start') return validArrival(value);
    return Boolean(parseDate(value)) && value > this.value && value <= addDays(this.value, 30);
  }

  render(focusDate) {
    const title = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(this.month);
    for (const boundary of ['start', 'end']) {
      const trigger = this.root.querySelector(`[data-boundary="${boundary}"]`);
      const value = boundary === 'start' ? this.value : this.endDate;
      trigger.querySelector('.date-value').textContent = formatDate(value);
      trigger.setAttribute('aria-label', `${boundary === 'start' ? 'Заезд' : 'Выезд'}: ${formatDate(value)}`);
      trigger.setAttribute('aria-expanded', String(this.open && this.selecting === boundary));
    }
    this.panel.hidden = !this.open;
    const first = (this.month.getDay() + 6) % 7;
    const count = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0).getDate();
    const minimum = (this.selecting === 'start' ? todayISO() : this.value).slice(0, 7);
    const maximum = (this.selecting === 'start' ? addDays(todayISO(), 365) : addDays(this.value, 30)).slice(0, 7);
    const previous = new Date(this.month); previous.setMonth(previous.getMonth() - 1);
    const next = new Date(this.month); next.setMonth(next.getMonth() + 1);
    const cells = Array.from({ length: first }, () => '<span class="calendar-blank" aria-hidden="true"></span>');
    for (let day = 1; day <= count; day++) {
      const value = toISO(new Date(this.month.getFullYear(), this.month.getMonth(), day, 12));
      const endpoint = value === this.value || value === this.endDate;
      const between = value > this.value && value < this.endDate;
      cells.push(`<button type="button" class="calendar-day ${between ? 'in-range' : ''}" data-date="${value}" aria-label="${formatDate(value)}" aria-pressed="${endpoint}" ${value === todayISO() ? 'aria-current="date"' : ''} ${this.available(value) ? '' : 'disabled'} tabindex="${value === (focusDate || (this.selecting === 'start' ? this.value : this.endDate)) ? '0' : '-1'}">${endpoint ? '<img src="images/wolf.svg" alt="" aria-hidden="true">' : ''}<span>${day}</span></button>`);
    }
    this.panel.innerHTML = `<div class="calendar-mode" role="status">${this.selecting === 'start' ? 'Выберите день заезда' : 'Теперь выберите день выезда'}</div><div class="calendar-heading"><button type="button" data-month="-1" aria-label="Предыдущий месяц" ${toISO(previous).slice(0, 7) < minimum ? 'disabled' : ''}>‹</button><strong aria-live="polite">${title}</strong><button type="button" data-month="1" aria-label="Следующий месяц" ${toISO(next).slice(0, 7) > maximum ? 'disabled' : ''}>›</button></div><div class="calendar-weekdays" aria-hidden="true">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(day => `<span>${day}</span>`).join('')}</div><div class="calendar-days" role="group" aria-label="Даты поездки, ${title}">${cells.join('')}</div><p class="calendar-help">Волки отмечают заезд и выезд · от 1 до 30 ночей</p>`;
    if (!this.panel.querySelector('.calendar-day[tabindex="0"]:not(:disabled)')) {
      this.panel.querySelectorAll('.calendar-day').forEach(day => day.tabIndex = -1);
      this.panel.querySelector('.calendar-day:not(:disabled)')?.setAttribute('tabindex', '0');
    }
    this.root.querySelector('.departure-note').textContent = `${this.nights} ноч. · ${formatDate(this.value)} — ${formatDate(this.endDate)}`;
  }

  click(event) {
    const trigger = event.target.closest('[data-boundary]');
    if (trigger) {
      const boundary = trigger.dataset.boundary;
      this.open = !this.open || this.selecting !== boundary;
      this.selecting = boundary;
      this.month = parseDate(boundary === 'start' ? this.value : this.endDate);
      this.month.setDate(1);
      this.render();
      if (this.open) this.panel.querySelector('.calendar-day[tabindex="0"]')?.focus();
      return;
    }
    const month = event.target.closest('[data-month]');
    if (month && !month.disabled) {
      this.month.setMonth(this.month.getMonth() + Number(month.dataset.month));
      this.render();
      this.panel.querySelector(`button[data-month="${month.dataset.month}"]`)?.focus();
    }
    const day = event.target.closest('[data-date]');
    if (!day || day.disabled) return;
    if (this.selecting === 'start') {
      this.value = day.dataset.date;
      if (this.nights < 1 || this.nights > 30) this.endDate = addDays(this.value, 1);
      this.selecting = 'end';
      this.month = parseDate(this.endDate); this.month.setDate(1);
      this.render(this.endDate);
      this.panel.querySelector(`[data-date="${this.endDate}"]`)?.focus();
    } else {
      this.endDate = day.dataset.date;
      this.open = false;
      this.render();
      this.root.querySelector('[data-boundary="end"]').focus();
    }
    this.onChange();
  }

  keydown(event) {
    if (event.key === 'Escape' && this.open) {
      event.preventDefault(); event.stopPropagation();
      this.open = false; this.render();
      this.root.querySelector(`[data-boundary="${this.selecting}"]`).focus();
      return;
    }
    const day = event.target.closest('[data-date]');
    if (!day) return;
    const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let target;
    if (event.key in steps) target = addDays(day.dataset.date, steps[event.key]);
    else if (event.key === 'Home') target = addDays(day.dataset.date, -((parseDate(day.dataset.date).getDay() + 6) % 7));
    else if (event.key === 'End') target = addDays(day.dataset.date, 6 - ((parseDate(day.dataset.date).getDay() + 6) % 7));
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const date = parseDate(day.dataset.date), originalDay = date.getDate();
      date.setDate(1); date.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      date.setDate(Math.min(originalDay, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
      target = toISO(date);
    } else return;
    event.preventDefault();
    if (!this.available(target)) return;
    this.month = parseDate(target); this.month.setDate(1);
    this.render(target);
    this.panel.querySelector(`[data-date="${target}"]`)?.focus();
  }
}
