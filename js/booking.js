import { shelters, purposes, extras } from './data.js';
import { todayISO, parseDate, addDays, validArrival } from './calendar.js';
export const STORAGE_KEY = 'northern-frontier-bookings-v1';
const purposeIds = new Set(purposes.map(purpose => purpose.id));

export function validateValues(house, guests, nights) {
  const errors = {};
  if (!Number.isInteger(guests) || guests < 1 || guests > house.guests) errors.guests = `От 1 до ${house.guests}, целое число`;
  if (!Number.isInteger(nights) || nights < 1 || nights > 30) errors.nights = 'От 1 до 30, целое число';
  return errors;
}

export function calculateCost(house, guests, nights, extraIds = []) {
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

export function validateSaved(value) {
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
export function decodeState(value) {
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

export class BookingStore {
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
