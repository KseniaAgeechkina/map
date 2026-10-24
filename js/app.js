/* Автономная версия сайта. Исходники: соседние файлы JS. */
(() => {
'use strict';

// data.js
// Единый источник данных для карты, списка и формы.
const shelters = [
  { id: 'black', name: 'Покои Чёрной крепости', type: 'КАМЕННАЯ КРЕПОСТЬ', guests: 4, price: 120, x: 52, y: 26, occupied: false, scene: 'fortress', description: 'Толстые каменные стены, шерстяные покрывала и очаг, за которым следит Ночной дозор. Из окна видна великая ледяная Стена.', perks: ['Большой очаг', 'Вид на Стену', 'Ужин в крепости'] },
  { id: 'raven', name: 'Башня ворона', type: 'СТОРОЖЕВАЯ БАШНЯ', guests: 2, price: 85, x: 75, y: 21, occupied: true, scene: 'tower', description: 'Тихая комната под крышей старой башни. Здесь слышно, как ветер перебирает перья почтовых воронов.', perks: ['Тёплая комната', 'Библиотека', 'Высокая башня'] },
  { id: 'forest', name: 'Дом лесного дозорного', type: 'ЛЕСНОЙ ДОМ', guests: 3, price: 70, x: 17, y: 46, occupied: false, scene: 'cabin', description: 'Небольшой деревянный дом среди заснеженных елей. На полке — карты леса, у двери — запас сухих дров.', perks: ['Дровяная печь', 'Лесная тропа', 'Горячий завтрак'] },
  { id: 'wolf', name: 'Пристанище Белого волка', type: 'ДОМ НА ОПУШКЕ', guests: 2, price: 95, x: 55, y: 53, occupied: false, scene: 'cabin', description: 'Уединённое пристанище у древней рощи. По вечерам к опушке выходит белый волк — хранитель здешних дорог.', perks: ['Камин', 'Уединение', 'Вид на рощу'] },
  { id: 'lighthouse', name: 'Восточный маяк', type: 'ПРИБРЕЖНОЕ ПРИСТАНИЩЕ', guests: 4, price: 110, x: 90, y: 48, occupied: false, scene: 'tower', description: 'Свет маяка ведёт путников сквозь метель. Внизу шумит холодное море, а наверху всегда найдётся чашка горячего чая.', perks: ['Морской вид', 'Печь', 'Чай с травами'] },
  { id: 'old', name: 'Старая сторожка', type: 'МАЛЕНЬКОЕ ПРИСТАНИЩЕ', guests: 1, price: 40, x: 14, y: 70, occupied: true, scene: 'cabin', description: 'Скромная сторожка для одинокого путника. Ничего лишнего — кровать, тёплая печь и тишина.', perks: ['Печь', 'Тишина', 'Один гость'] },
  { id: 'river', name: 'Дом у ледяной переправы', type: 'БОЛЬШОЙ ДОМ', guests: 5, price: 130, x: 44, y: 77, occupied: false, scene: 'cabin', description: 'Просторный дом у замёрзшей реки. За большим столом удобно собраться всей компанией и спланировать завтрашний путь.', perks: ['Большой стол', 'Пять спальных мест', 'Очаг'] },
  { id: 'west', name: 'Западный караул', type: 'КАМЕННЫЙ ФОРТ', guests: 3, price: 75, x: 79, y: 73, occupied: false, scene: 'fortress', description: 'Старый форт на перекрёстке северных дорог. Дозорные поделятся историями, а каменные стены укроют от ветра.', perks: ['Камин', 'Конюшня', 'Ужин'] }
];

// Цель похода меняет рассказ и герб грамоты, но не стоимость ночлега.
const purposes = [
  { id: 'aurora', name: 'Северное сияние', icon: '✧', short: 'Наблюдать сияние', story: 'Когда стихнет ветер, дозорный проводит ваш отряд к месту, откуда небо видно до самого края Стены.', ending: 'Сохраните тепло очага до той минуты, когда над Стеной развернутся светящиеся ленты.' },
  { id: 'ruins', name: 'Забытые руины', icon: '◇', short: 'Исследовать руины', story: 'В пристанище для вас оставят старую карту. На ней отмечена тропа к руинам, о которых почти забыли на юге.', ending: 'Древние камни хранят больше историй, чем книги. Завтра вы услышите одну из них.' },
  { id: 'dragons', name: 'Следы драконов', icon: '♜', short: 'Искать следы драконов', story: 'На рассвете смотритель укажет скалы с оплавленным камнем. Иногда над ними проходит огромная тень.', ending: 'Держитесь вместе. Не каждый след в снегу оставлен существом, которое ходит по земле.' }
];

const experiences = {
  black: { title: 'Вечер с Ночным дозором', text: 'За длинным столом рассказывают истории, которые не доходят до южных земель.' },
  raven: { title: 'Сияние над Стеной', text: 'С верхней площадки видно, как холодное небо загорается без единого факела.' },
  forest: { title: 'Тропы Зачарованного леса', text: 'Смотритель знает лесные знаки и покажет дорогу, которой нет на обычных картах.' },
  wolf: { title: 'По следу лютоволка', text: 'На рассвете у опушки появляются свежие следы. Хранитель леса прошёл совсем рядом.' },
  lighthouse: { title: 'Огни у края моря', text: 'Ночью маяк отвечает далёким огням на воде. Никто не знает, чьи это корабли.' },
  old: { title: 'Ночь вдали от караулов', text: 'Только ветер, треск дров и старые зарубки на двери. Здесь Север говорит шёпотом.' },
  river: { title: 'Путь к забытым руинам', text: 'За ледяной переправой видны каменные ворота — всё, что осталось от древнего поселения.' },
  west: { title: 'Тень над западными скалами', text: 'Дозорные находят оплавленный камень и спорят, кто пролетает над фортом после заката.' }
};

// Все дополнительные услуги добровольные; единицы расчёта видны в форме.
const extras = [
  { id: 'hearth', name: 'Очаг до рассвета', note: 'Смотритель поддерживает огонь всю ночь.', price: 25, unit: 'night', label: '25 монет / ночь' },
  { id: 'feast', name: 'Северный пир', note: 'Горячее угощение для каждого участника отряда.', price: 35, unit: 'guest', label: '35 монет / гость' },
  { id: 'horses', name: 'Место в конюшне', note: 'Крытые стойла и корм для ваших лошадей.', price: 20, unit: 'night', label: '20 монет / ночь' },
  { id: 'guide', name: 'Проводник за Стену', note: 'Один выход по старой тропе с опытным дозорным.', price: 90, unit: 'stay', label: '90 монет / поход' }
];


// calendar.js
// Работа с календарными днями без сдвигов из-за UTC и переходов времени.
function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const todayISO = () => toISO(new Date());
function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return toISO(date) === value ? date : null;
}
function addDays(value, days) {
  const date = parseDate(value);
  if (!date || !Number.isInteger(days)) return null;
  date.setDate(date.getDate() + days);
  return toISO(date);
}
function validArrival(value) {
  return Boolean(parseDate(value)) && value >= todayISO() && value <= addDays(todayISO(), 365);
}
function formatDate(value) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date) : 'Дата не указана';
}

function nightsBetween(start, end) {
  const a = parseDate(start), b = parseDate(end);
  return a && b ? Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000) : 0;
}

class ArrivalCalendar {
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


// booking.js
const STORAGE_KEY = 'northern-frontier-bookings-v1';
const purposeIds = new Set(purposes.map(purpose => purpose.id));

function validateValues(house, guests, nights) {
  const errors = {};
  if (!Number.isInteger(guests) || guests < 1 || guests > house.guests) errors.guests = `От 1 до ${house.guests}, целое число`;
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) errors.nights = 'От 1 до 30, целое число';
  return errors;
}

function calculateCost(house, guests, nights, extraIds = []) {
  if (!Array.isArray(extraIds) || new Set(extraIds).size !== extraIds.length || extraIds.some(id => !extras.some(extra => extra.id === id))) throw new Error('Проверьте дополнительные услуги.');
  const baseTotal = house.price * nights;
  const extrasTotal = extraIds.reduce((sum, id) => {
    const extra = extras.find(item => item.id === id);
    return sum + extra.price * (extra.unit === 'night' ? nights : extra.unit === 'guest' ? guests : 1);
  }, 0);
  return { baseTotal, extrasTotal, total: baseTotal + extrasTotal };
}

function normalizeRecord(item) {
  const house = shelters.find(h => h.id === item?.houseId);
  const purpose = item?.purpose ?? 'aurora';
  if (!house || house.occupied || typeof item.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(item.id) || !purposeIds.has(purpose) || Object.keys(validateValues(house, item.guests, item.nights)).length) {
    throw new Error('Некорректная запись брони');
  }
  const date = value => Number.isFinite(value) && value > 0 && value < 9e12 ? value : null;
  return {
    id: item.id, houseId: house.id, guests: item.guests, nights: item.nights,
    ...calculateCost(house, item.guests, item.nights, item.extras ?? []), purpose, extras: item.extras ?? [],
    createdAt: date(item.createdAt), cancelledAt: date(item.cancelledAt),
    startDate: parseDate(item.startDate) ? item.startDate : null,
    endDate: parseDate(item.startDate) ? addDays(item.startDate, item.nights) : null
  };
}

function validateSaved(value) {
  if (!Array.isArray(value) || value.length > shelters.length) throw new Error('Некорректный список броней');
  const houses = new Set();
  const ids = new Set();
  return value.map(item => {
    const record = normalizeRecord(item);
    if (houses.has(record.houseId) || ids.has(record.id)) throw new Error('Повторная бронь');
    houses.add(record.houseId);
    ids.add(record.id);
    return record;
  });
}

// Версия 2 хранит хронику и настройки в том же единственном ключе.
// Старые сохранения-массивы автоматически читаются без потери броней.
function decodeState(value) {
  if (Array.isArray(value)) return { records: validateSaved(value), history: [], world: 'night', fog: true };
  if (!value || value.version !== 2) throw new Error('Неизвестное сохранение');
  const records = validateSaved(value.records);
  if (!Array.isArray(value.history) || value.history.length > 50) throw new Error('Некорректная хроника');
  const ids = new Set(records.map(record => record.id));
  const history = value.history.map(item => {
    const record = normalizeRecord(item);
    if (ids.has(record.id) || !record.cancelledAt) throw new Error('Некорректная запись хроники');
    ids.add(record.id);
    return record;
  });
  return { records, history, world: value.world === 'day' ? 'day' : 'night', fog: value.fog !== false };
}

class BookingStore {
  constructor(storage, report) {
    this.storage = storage;
    this.report = report;
    this.records = [];
    this.history = [];
    this.world = 'night';
    this.fog = true;
    try { this.restore(storage.getItem(STORAGE_KEY)); }
    catch { report('Не удалось прочитать сохранение. Можно продолжить или сбросить демо.'); }
  }

  restore(raw) {
    const state = raw === null
      ? { records: [], history: [], world: 'night', fog: true }
      : decodeState(JSON.parse(raw));
    Object.assign(this, state);
  }

  occupied(id) {
    return shelters.find(house => house.id === id)?.occupied || this.records.some(record => record.houseId === id);
  }

  save() {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, records: this.records, history: this.history, world: this.world, fog: this.fog }));
      return true;
    } catch {
      this.report('Изменения действуют в этой вкладке, но браузер запретил сохранение. После обновления они пропадут.');
      return false;
    }
  }

  add(houseId, guests, nights, purpose = 'aurora', startDate = todayISO(), extraIds = []) {
    const house = shelters.find(item => item.id === houseId);
    if (!house || this.occupied(houseId)) throw new Error('Выберите свободное пристанище.');
    if (Object.keys(validateValues(house, guests, nights)).length || !purposeIds.has(purpose) || !validArrival(startDate)) throw new Error('Проверьте гостей, ночи, дату заезда и цель похода.');
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const record = { id, houseId, guests, nights, purpose, ...calculateCost(house, guests, nights, extraIds), extras: [...extraIds], createdAt: Date.now(), cancelledAt: null, startDate, endDate: addDays(startDate, nights) };
    this.records.push(record);
    this.save();
    return record;
  }

  cancel(id) {
    const record = this.records.find(item => item.id === id);
    if (!record) return;
    this.history.unshift({ ...record, cancelledAt: Date.now() });
    this.history = this.history.slice(0, 50);
    this.records = this.records.filter(item => item.id !== id);
    this.save();
  }

  setWorld(world) {
    if (!['day', 'night'].includes(world)) return;
    this.world = world;
    this.save();
  }

  setFog(enabled) {
    this.fog = Boolean(enabled);
    this.save();
  }

  reset() {
    this.records = [];
    this.history = [];
    this.save();
  }
}


// icons.js
// Три небольших герба: сияние, руины и дракон. Это собственные SVG, без шрифтовых иконок.
const paths = {
  aurora: '<path d="M5 19c5-14 7 7 12-8s5 5 10-5M5 25c5-13 8 6 13-6s5 3 9-1"/><path d="m21 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
  ruins: '<path d="M5 28h22M8 28V10l6-5 4 5 6-2v20M12 28V17a4 4 0 0 1 8 0v11M8 12h5m7-1h4M12 5l2 5-3 4"/>',
  dragons: '<path d="m6 22 4-5 6 1 4-6 5-2 3 3-5 1-2 5-5 4-6 1-4 4M16 18 9 5l-4 7 5 2-2 5m10-3 3-12 5 4-4 3m-9 12-1 5m8-9 5 4"/>'
};
function missionIcon(id) {
  return `<svg class="mission-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id] || paths.aurora}</svg>`;
}


// filters.js
// Выпадающий фильтр со своим оформлением и клавиатурным управлением.
class CustomFilter {
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


// atmosphere.js
// Эффекты не влияют на брони. Их можно отключить, а список всегда доступен.
class WorldController {
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


// map.js
// Навигация по собственной карте: зум у указателя, перетаскивание и pinch.
class AtlasMap {
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


// main.js
// Общие состояния страницы. Состояние броней принадлежит BookingStore.
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('ru-RU').format(value);
const shortId = id => id.replaceAll('-', '').slice(-8).toUpperCase();
let selected = null;
let guests = 1;
let maxPrice = 999;
let bookingPending = false;
let openingHouse = false;
let calendar = null;
let selectedPurpose = 'aurora';
let persistenceWarning = '';
let notificationTimer;

function notify(message) {
  $('#notice').textContent = message;
  $('#notice').classList.add('visible');
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => $('#notice').classList.remove('visible'), 6500);
}

let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem() { throw new Error('Хранилище недоступно'); },
    setItem() { throw new Error('Хранилище недоступно'); },
    removeItem() { throw new Error('Хранилище недоступно'); }
  };
}
const store = new BookingStore(storage, message => {
  persistenceWarning = message;
  notify(message);
});
document.querySelectorAll('.custom-filter').forEach(root => new CustomFilter(root));
const world = new WorldController(store);
const atlas = new AtlasMap($('#map-viewport'));
let wizardStep = 0;
const purposeFor = id => purposes.find(item => item.id === id) || purposes[0];
const visible = () => shelters.filter(house => house.guests >= guests && house.price <= maxPrice);
const crop = house => `background-image:url('images/houses/${house.id}.webp');background-position:center;background-size:cover;`;
const guestLabel = house => house.guests === 1 ? 'Для 1 гостя' : `До ${house.guests} гостей`;
const mapNames = {
  black: 'Чёрная крепость', raven: 'Башня ворона', forest: 'Дом дозорного',
  wolf: 'Белый волк', lighthouse: 'Восточный маяк', old: 'Старая сторожка',
  river: 'Ледяная переправа', west: 'Западный караул'
};

// Карта и список всегда строятся из одних данных и одного фильтра.
function renderObjects() {
  const houses = visible();
  $('#result-count').textContent = `На карте: ${houses.length} из ${shelters.length}`;
  $('#empty').hidden = houses.length > 0;
  $('#markers').innerHTML = houses.map(house => {
    const busy = store.occupied(house.id);
    const chosen = selected === house.id;
    return `
      <button class="marker ${chosen ? 'selected' : ''}" data-house="${house.id}"
        style="left:${house.x}%;top:${house.y}%" ${busy ? 'disabled' : ''}
        aria-pressed="${chosen}" aria-label="${house.name}: ${busy ? 'занят' : 'свободен'}, ${house.price} монет за ночь">
        <span class="pin" aria-hidden="true">${busy ? '×' : chosen ? '✓' : '⌂'}</span>
        <span class="label">${mapNames[house.id]}<small>${busy ? 'Занят' : chosen ? 'Ваш выбор' : 'Свободен'}</small></span>
      </button>`;
  }).join('');

  $('#shelter-list').innerHTML = houses.map(house => {
    const busy = store.occupied(house.id);
    const chosen = selected === house.id;
    const number = String(shelters.indexOf(house) + 1).padStart(2, '0');
    return `
      <button class="shelter-card ${chosen ? 'selected' : ''}" data-house="${house.id}"
        ${busy ? 'disabled' : ''} aria-pressed="${chosen}">
        <span class="card-image">
          <span class="scene-crop" style="${crop(house)}" aria-hidden="true"></span>
          <span class="card-number">${number}</span>
          <span class="availability">${busy ? '× Занят' : chosen ? '✓ Выбран' : '⌂ Свободен'}</span>
        </span>
        <span class="card-body">
          <span class="card-type">${house.type}</span>
          <strong>${house.name}</strong>
          <span class="card-experience">${experiences[house.id].title}</span>
          <span class="card-bottom"><span>${guestLabel(house)}</span><span><b>${house.price}</b> <small>монет / ночь</small></span><span aria-hidden="true">↗</span></span>
        </span>
      </button>`;
  }).join('');
}

function renderDetail() {
  const house = shelters.find(item => item.id === selected);
  if (!house) { $('#detail').replaceChildren(); return; }
  wizardStep = 0;
  $('#detail').innerHTML = `
    <div class="detail-art"><div class="scene-crop" style="${crop(house, true)}" role="img" aria-label="Земли вокруг пристанища"></div><div class="detail-art-caption"><span>ЗЕМЛИ НОЧНОГО ДОЗОРА</span><strong>У каждого огня<br>своя история.</strong><img src="images/wolf.svg" alt=""></div></div>
    <div class="detail-body">
      <p class="eyebrow">ПРИСТАНИЩЕ № ${String(shelters.indexOf(house) + 1).padStart(2, '0')}</p><h3>${house.name}</h3>
      <nav class="booking-progress" aria-label="Шаги бронирования"><button type="button" data-step="0">01 · История</button><button type="button" data-step="1">02 · Даты</button><button type="button" data-step="2">03 · Услуги</button></nav>
      <form class="booking-form" id="booking-form" novalidate>
        <section class="stay-step" data-panel="0" aria-label="Описание пристанища">
          <p class="description">${house.description}</p><div class="perks">${house.perks.map(perk => `<span>${perk}</span>`).join('')}</div>
          <div class="experience-note"><strong>${experiences[house.id].title}</strong><p>${experiences[house.id].text}</p></div>
          <fieldset class="purpose-picker"><legend>Цель вашего путешествия</legend><div class="purpose-options">${purposes.map(purpose => `<label><input type="radio" name="purpose" aria-label="${purpose.name}" value="${purpose.id}" ${purpose.id === selectedPurpose ? 'checked' : ''}><span><b aria-hidden="true">${missionIcon(purpose.id)}</b>${purpose.name}</span></label>`).join('')}</div></fieldset>
          <p id="route-preview" class="route-preview" aria-live="polite">${purposeFor(selectedPurpose).story}</p>
        </section>
        <section class="stay-step" data-panel="1" aria-label="Даты и состав отряда" hidden>
          <div class="fields"><label>Путешественников · до ${house.guests}<span class="guest-stepper"><button type="button" data-guests="-1" aria-label="На одного путешественника меньше">−</button><input id="guests" name="guests" aria-label="Путешественников" type="number" min="1" max="${house.guests}" step="1" value="${guests}" required aria-describedby="guests-error"><button type="button" data-guests="1" aria-label="На одного путешественника больше">+</button></span><span class="error" id="guests-error"></span></label></div>
          <div id="arrival-calendar" class="arrival-calendar"></div>
        </section>
        <section class="stay-step" data-panel="2" aria-label="Дополнительные услуги" hidden>
          <p class="extras-intro">Добавьте немного северного гостеприимства. Все услуги — по желанию.</p>
          <div class="extra-options">${extras.map(extra => `<label class="extra-option"><input type="checkbox" name="extras" value="${extra.id}"><span class="extra-check" aria-hidden="true"></span><span><strong>${extra.name}</strong><small>${extra.note}</small></span><b>${extra.label}</b></label>`).join('')}</div>
        </section>
        <div class="booking-bottom"><div class="total"><span>Стоимость вашего пребывания<small id="cost-detail"></small></span><strong id="total">${house.price} монет</strong></div><div class="booking-actions"><button type="button" class="secondary" data-back hidden>Назад</button><button type="button" class="primary" data-next>Выбрать даты</button><button type="submit" class="primary" hidden>Получить грамоту</button></div><p class="fine">Учебная бронь · Без оплаты · Отмена в любой момент</p></div>
      </form>
    </div>`;
  calendar = new ArrivalCalendar($('#arrival-calendar'), () => updateTotal());
  setStep(0);
  updateTotal();
}

function setStep(step) {
  if (step === 2 && !updateTotal()) { step = 1; }
  wizardStep = Math.max(0, Math.min(2, step));
  $('#stay-dialog').dataset.step = wizardStep;
  document.querySelectorAll('[data-panel]').forEach(panel => panel.hidden = Number(panel.dataset.panel) !== wizardStep);
  document.querySelectorAll('.booking-progress [data-step]').forEach(button => button.setAttribute('aria-current', Number(button.dataset.step) === wizardStep ? 'step' : 'false'));
  $('#detail [data-back]').hidden = wizardStep === 0;
  $('#detail [data-next]').hidden = wizardStep === 2;
  $('#detail [data-next]').textContent = wizardStep === 0 ? 'Выбрать даты' : 'Дополнительные услуги';
  $('#detail button[type="submit"]').hidden = wizardStep !== 2;
}

function bookingValues() {
  return { guests: Number($('#guests').value), nights: calendar.nights, purpose: selectedPurpose, startDate: calendar.value, extras: [...document.querySelectorAll('input[name="extras"]:checked')].map(input => input.value) };
}

async function selectHouse(id) {
  if (openingHouse || bookingPending || store.occupied(id) || !visible().some(house => house.id === id)) return;
  openingHouse = true;
  selected = id;
  renderObjects();
  world.reveal(shelters.find(house => house.id === id).x, shelters.find(house => house.id === id).y);
  try {
    if (selected !== id || store.occupied(id) || !visible().some(house => house.id === id)) return;
    renderDetail();
    $('#stay-dialog').dataset.purpose = selectedPurpose;
    $('#stay-dialog').showModal();
  } finally {
    openingHouse = false;
  }
}

function updateTotal() {
  const house = shelters.find(item => item.id === selected);
  if (!house) return false;
  const values = bookingValues();
  const errors = validateValues(house, values.guests, values.nights);
  for (const field of ['guests']) {
    $(`#${field}-error`).textContent = errors[field] || '';
    $(`#${field}`).setAttribute('aria-invalid', String(Boolean(errors[field])));
  }
  const cost = calculateCost(house, values.guests, values.nights, values.extras);
  $('#total').textContent = errors.nights || errors.guests ? '—' : `${money(cost.total)} монет`;
  $('#cost-detail').textContent = errors.guests ? '' : `${values.nights} ноч. × ${house.price} монет${cost.extrasTotal ? ` + услуги ${money(cost.extrasTotal)}` : ''}`;
  return Object.keys(errors).length === 0 && validArrival(values.startDate);
}

// Одна и та же сводка используется до подтверждения и в готовой грамоте.
function summary(house, values, id = '') {
  const mission = purposeFor(values.purpose);
  const cost = calculateCost(house, values.guests, values.nights, values.extras || []);
  return `
    <div class="gramota-summary">
      <strong class="gramota-house">${house.name}</strong><p class="gramota-mission" data-purpose="${mission.id}"><span aria-hidden="true">${missionIcon(mission.id)}</span> ${mission.short}</p>
      <p class="gramota-dates">${values.startDate ? `${formatDate(values.startDate)} — ${formatDate(addDays(values.startDate, values.nights))}` : "Дата не была указана в прежней грамоте"}</p>
      <div class="gramota-grid">
        <div><small>Путешественников</small><b>${values.guests}</b></div>
        <div><small>Ночей у огня</small><b>${values.nights}</b></div>
        <div><small>Итого</small><b>${money(cost.total)} <em>монет</em></b></div>
      </div>
      ${values.extras?.length ? `<p class="gramota-extras">${values.extras.map(id => extras.find(extra => extra.id === id).name).join(' · ')} · Проживание ${money(cost.baseTotal)} + услуги ${money(cost.extrasTotal)} монет</p>` : ''}
      ${id ? `<p class="gramota-number">ГРАМОТА № ${shortId(id)}</p>` : ''}
    </div>`;
}

function chronicleCard(record, cancelled = false) {
  const house = shelters.find(item => item.id === record.houseId);
  const mission = purposeFor(record.purpose);
  const date = record.createdAt
    ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(record.createdAt)
    : 'Из прежних путешествий';
  return `
    <article class="booking-record ${cancelled ? 'record-cancelled' : ''}" data-purpose="${mission.id}" data-record="${record.id}">
      <div class="record-stamp" aria-hidden="true"><span>${missionIcon(mission.id)}</span></div>
      <div class="record-story"><span class="eyebrow">ГРАМОТА № ${shortId(record.id)} · ${date}</span>
        <h3><button type="button" class="record-open" aria-label="Подробности брони: ${house.name}">${house.name}</button></h3><span class="record-mission">${mission.short}</span>
        <p class="record-dates">${record.startDate ? `${formatDate(record.startDate)} — ${formatDate(record.endDate)}` : "Без даты · прежняя грамота"}</p>${record.extras?.length ? `<p class="record-extras">${record.extras.map(id => extras.find(extra => extra.id === id).name).join(' · ')}</p>` : ''}<p>Отряд: ${record.guests} · Ночей: ${record.nights} · ${cancelled ? 'Поход отменён, пристанище освобождено' : 'Пристанище закреплено за вашим отрядом'}</p>
      </div>
      <span class="amount">${money(record.total)} <small>серебряных монет</small></span>
      ${cancelled ? '<span class="closed-record">Грамота отозвана</span>' : `<button class="text-button" data-cancel="${record.id}" aria-label="Отменить бронь: ${house.name}">Отозвать грамоту</button>`}
    </article>`;
}

function renderBookings() {
  $('#booking-count').textContent = store.records.length;
  const active = [...store.records].reverse().map(record => chronicleCard(record)).join('');
  const history = store.history.length
    ? `<h3 class="history-heading">Прежние замыслы <span>${store.history.length}</span></h3>${store.history.map(record => chronicleCard(record, true)).join('')}`
    : '';
  $('#booking-list').innerHTML = active || history ? active + history : `
    <div class="booking-empty"><img src="images/raven.svg" alt=""><p><strong>Север ещё не знает вашей истории.</strong>Выберите пристанище, соберите отряд и получите грамоту. Здесь появится ваша первая грамота.</p></div>`;
}

function renderAll() {
  renderObjects();
  renderBookings();
}

function confirmAction({ title, text, html = '', label = 'Подтвердить', kicker = 'КАНЦЕЛЯРИЯ СЕВЕРНОГО РУБЕЖА' }) {
  const dialog = $('#confirm-dialog');
  if (dialog.open) return Promise.resolve(false);
  $('#confirm-title').textContent = title;
  $('#confirm-text').textContent = text;
  $('#confirm-summary').innerHTML = html;
  $('#confirm-yes').textContent = label;
  $('#confirm-kicker').textContent = kicker;
  dialog.returnValue = '';
  dialog.showModal();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'yes'), { once: true }));
}

// Делегирование событий: новые карточки не создают новых обработчиков.
$('#shelters').addEventListener('click', event => {
  const button = event.target.closest('[data-house]');
  if (button && !button.disabled) selectHouse(button.dataset.house);
});
$('#detail').addEventListener('click', event => {
  const guestButton = event.target.closest('[data-guests]');
  if (guestButton) {
    const input = $('#guests');
    input.value = Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value) + Number(guestButton.dataset.guests)));
    updateTotal();
  }

  const step = event.target.closest('[data-step]');
  if (step) setStep(Number(step.dataset.step));
  if (event.target.closest('[data-next]')) setStep(wizardStep + 1);
  if (event.target.closest('[data-back]')) setStep(wizardStep - 1);
});
$('#detail').addEventListener('input', event => {
  if (event.target.matches('input[type="radio"]')) {
    selectedPurpose = event.target.value;
    $('#route-preview').textContent = purposeFor(selectedPurpose).story;
    $('#stay-dialog').dataset.purpose = selectedPurpose;
  } else if (event.target.matches('input')) updateTotal();
});
$('#detail').addEventListener('submit', async event => {
  event.preventDefault();
  if (bookingPending) return;
  if (!selected) return notify('Сначала выберите свободное пристанище.');
  if (!updateTotal()) { setStep(1); $('#detail input[aria-invalid="true"]')?.focus(); return; }

  bookingPending = true;
  const house = shelters.find(item => item.id === selected);
  const values = bookingValues();
  const submitButton = $('#booking-form button[type="submit"]');
  submitButton.disabled = true;
  $('#stay-dialog').close();
  const accepted = await confirmAction({
    title: 'Отряд готов к выходу?',
    text: 'Сверьте пристанище, состав отряда и цель похода. После подтверждения Ночной дозор отправит вам дорожную грамоту.',
    html: summary(house, values),
    label: 'Подтвердить бронь',
    kicker: 'ОСТАЛСЯ ОДИН ШАГ ДО ТЁПЛОГО ОЧАГА'
  });

  try {
    if (!accepted) {
      if (selected === house.id && !store.occupied(house.id)) $('#stay-dialog').showModal();
      return;
    }
    persistenceWarning = '';
    const record = store.add(house.id, values.guests, values.nights, values.purpose, values.startDate, values.extras);
    selected = null;
    renderAll();
    $('#success-summary').innerHTML = summary(house, values, record.id);
    if (persistenceWarning) {
      const warning = document.createElement('p');
      warning.className = 'save-warning';
      warning.textContent = persistenceWarning;
      $('#success-summary').append(warning);
    }
    const mission = purposeFor(values.purpose);
    $('#success-dialog').dataset.purpose = mission.id;
    $('#mission-ending').textContent = mission.ending;
    $('#sealed-letter').hidden = false;
    $('#opened-letter').hidden = true;
    $('#sealed-letter').classList.remove('opening');
    $('#break-seal').disabled = false;
    $('#delivery-status').textContent = 'Грамота готова. Вскройте печать Ночного дозора.';
    $('#success-dialog').setAttribute('aria-labelledby', 'delivery-title');
    $('#success-dialog').showModal();
    $('#break-seal').disabled = false;
    $('#delivery-status').textContent = 'Письмо доставлено. Печать Ночного дозора цела.';
    if ($('#success-dialog').open && !$('#sealed-letter').hidden) $('#break-seal').focus({ preventScroll: true });
  } catch (error) {
    notify(error.message);
    renderAll();
  } finally {
    bookingPending = false;
    submitButton.disabled = false;
  }
});

function filter() {
  guests = Number($('#guest-filter').value);
  maxPrice = Number($('#price-filter').value);
  if (selected && !visible().some(house => house.id === selected)) {
    selected = null;
    notify('Выбранное пристанище скрыто фильтрами. Выберите другое.');
  }
  renderObjects();
}
$('#filters').addEventListener('change', filter);
$('#filters').addEventListener('reset', () => setTimeout(filter, 0));

$('#booking-list').addEventListener('click', async event => {
  const button = event.target.closest('[data-cancel]');
  if (!button) {
    const card = event.target.closest('[data-record]');
    if (!card) return;
    const saved = [...store.records, ...store.history].find(item => item.id === card.dataset.record);
    if (!saved) return;
    const house = shelters.find(item => item.id === saved.houseId);
    $('#record-description').textContent = house.description;
    $('#record-summary').innerHTML = summary(house, saved, saved.id);
    $('#record-dialog').dataset.purpose = saved.purpose;
    $('#record-dialog').showModal();
    return;
  }
  const record = store.records.find(item => item.id === button.dataset.cancel);
  if (!record) return;
  const house = shelters.find(item => item.id === record.houseId);
  const accepted = await confirmAction({
    title: 'Отозвать грамоту?',
    text: 'Если отменить бронь, пристанище снова станет доступно другим путешественникам.',
    html: summary(house, record),
    label: 'Отозвать и освободить пристанище',
    kicker: 'ОТМЕНА ДОРОЖНОЙ ГРАМОТЫ'
  });
  if (accepted) {
    store.cancel(record.id);
    renderAll();
    notify('Бронь отменена. Пристанище снова свободно.');
    $('#bookings').focus({ preventScroll: true });
  }
});

$('#reset-demo').addEventListener('click', async () => {
  const accepted = await confirmAction({
    title: 'Начать новый путь?',
    text: 'Все ваши учебные брони и записи хроники будут удалены. Два изначально занятых пристанища останутся занятыми.',
    label: 'Удалить записи',
    kicker: 'НОВАЯ СТРАНИЦА ВАШЕЙ ИСТОРИИ'
  });
  if (accepted) {
    store.reset();
    selected = null;
    renderAll();
    notify('Демо сброшено. Можно выбрать новый пристанище.');
  }
});

// Нативный dialog удерживает клавиатурный фокус внутри окна и закрывается по Esc.
document.addEventListener('click', event => {
  const close = event.target.closest('[data-close]');
  if (close) document.getElementById(close.dataset.close).close();
});
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('close', () => {
    // Кнопка, открывшая окно, могла быть перерисована. Возвращаем фокус явно.
    if (!document.querySelector('dialog[open]')) {
      const target = selected && !store.occupied(selected)
        ? document.querySelector(`.marker[data-house="${selected}"]`)
        : document.querySelector('.nav-link[href="#bookings"]');
      target?.focus({ preventScroll: true });
    }
  });
}
$('#view-bookings').addEventListener('click', () => {
  $('#success-dialog').close();
  $('#bookings').scrollIntoView({ behavior: 'smooth' });
  $('#bookings').focus({ preventScroll: true });
  setActiveNav('#bookings');
});

let breakingSeal = false;
async function openLetter(animate = true) {
  if (breakingSeal || $('#sealed-letter').hidden) return;
  breakingSeal = true;
  if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $('#sealed-letter').classList.add('opening');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  $('#sealed-letter').hidden = true;
  $('#opened-letter').hidden = false;
  $('#success-dialog').setAttribute('aria-labelledby', 'success-title');
  if ($('#success-dialog').open) $('#view-bookings').focus({ preventScroll: true });
  breakingSeal = false;
}
$('#break-seal').addEventListener('click', () => openLetter());
$('#skip-letter').addEventListener('click', () => openLetter(false));

// Изменения из второй вкладки обновляют занятость без перезагрузки.
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    store.restore(event.newValue);
    world.render();
    if (selected && store.occupied(selected)) {
      selected = null;
      $('#stay-dialog').close();
    }
    renderAll();
    notify('Хроника и настройки обновлены из другой вкладки.');
  } catch {
    notify('Не удалось обновить брони из другой вкладки.');
  }
});
function setActiveNav(hash) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.hash === hash));
}
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => setActiveNav(link.hash)));
renderAll();

})();
