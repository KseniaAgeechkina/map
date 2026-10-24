import { shelters, purposes, experiences, extras } from './data.js';
import { WorldController } from './atmosphere.js';
import { missionIcon } from './icons.js';
import { AtlasMap } from './map.js';
import { CustomFilter } from './filters.js';
import { ArrivalCalendar, formatDate, validArrival, addDays } from './calendar.js';
import { BookingStore, STORAGE_KEY, validateValues, calculateCost } from './booking.js';

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
