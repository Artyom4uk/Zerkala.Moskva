const state = {
  type: 'standard',
  name: 'Титульное',
  width: 600,
  height: 900,
  orderNumber: 1,
  prices: { standard: null, standardPlus: null, customPerM2: null, delivery: null, installation: null }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function formatPrice(value) {
  if (value === null || value === undefined) return 'Уточняется';
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function typeLabel(type) {
  return type === 'standardPlus' ? 'Стандарт+' : type === 'custom' ? 'Нестандарт' : 'Стандарт';
}

function updatePreview() {
  const mirror = $('#bigMirror');
  const minW = 180, maxW = 5000, minH = 180, maxH = 5000;
  const width = Math.max(minW, Math.min(maxW, Number(state.width) || 600));
  const height = Math.max(minH, Math.min(maxH, Number(state.height) || 900));
  const ratio = width / height;
  const maxWidth = window.innerWidth <= 760 ? 230 : 290;
  const maxHeight = window.innerWidth <= 760 ? 310 : 410;
  let visualW = Math.sqrt(ratio) * 240;
  let visualH = visualW / ratio;
  if (visualH > maxHeight) { visualH = maxHeight; visualW = visualH * ratio; }
  if (visualW > maxWidth) { visualW = maxWidth; visualH = visualW / ratio; }
  mirror.style.width = `${Math.max(120, visualW)}px`;
  mirror.style.height = `${Math.max(160, visualH)}px`;
  $('#selectedTitle').textContent = state.name;
  $('#formOrderName').textContent = `${state.name} · ${typeLabel(state.type)}`;
}

function updatePrices() {
  let mirrorPrice = null;
  if (state.type === 'standard') mirrorPrice = state.prices.standard;
  if (state.type === 'standardPlus') mirrorPrice = state.prices.standardPlus;
  if (state.type === 'custom' && state.prices.customPerM2 !== null) {
    mirrorPrice = (state.width * state.height / 1000000) * state.prices.customPerM2;
  }
  $('#mirrorPrice').textContent = formatPrice(mirrorPrice);
  $('#deliveryPrice').textContent = formatPrice(state.prices.delivery);
  $('#installPrice').textContent = formatPrice(state.prices.installation);
  const total = [mirrorPrice, state.prices.delivery, state.prices.installation];
  $('#totalPrice').textContent = total.every(v => typeof v === 'number') ? formatPrice(total.reduce((a,b) => a+b, 0)) : 'Уточняется';
  $('#formOrderPrice').textContent = $('#totalPrice').textContent;
}

function setType(type, name) {
  state.type = type;
  if (name) state.name = name;
  $$('#setSelector button').forEach(btn => btn.classList.toggle('selected', btn.dataset.type === type));
  const custom = type === 'custom';
  $('#dimensions').style.opacity = custom ? '1' : '.72';
  $('#dimensionHelp').textContent = custom
    ? 'Введите реальные размеры в миллиметрах. Допустимые пределы подтвердит владелец.'
    : 'Для стандартных наборов размеры и состав будут уточнены владельцем.';
  updatePreview();
  updatePrices();
}

$$('.choose-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setType(btn.dataset.type, btn.dataset.name);
    document.querySelector('#configurator').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

$$('#setSelector button').forEach(btn => {
  btn.addEventListener('click', () => setType(btn.dataset.type));
});

$$('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    $$('.mirror-card').forEach(card => {
      card.style.display = card.dataset.type === filter ? '' : 'none';
    });
    document.querySelector('#mirrors').scrollIntoView({ behavior: 'smooth' });
  });
});

$('#widthInput').addEventListener('input', e => { state.width = Number(e.target.value); updatePreview(); updatePrices(); });
$('#heightInput').addEventListener('input', e => { state.height = Number(e.target.value); updatePreview(); updatePrices(); });

$('#resetConfig').addEventListener('click', () => {
  $('#widthInput').value = 600;
  $('#heightInput').value = 900;
  state.width = 600; state.height = 900; state.name = 'Титульное';
  setType('standard', 'Титульное');
});

$('#startOrder').addEventListener('click', () => {
  document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => $('#surname').focus(), 450);
});

function validMoscowAddress(value) {
  const normalized = value.toLowerCase().trim();
  // We intentionally do not try to geocode addresses in the frontend.
  // Final Moscow-only verification belongs to the backend/order manager.
  const regionWords = ['область', 'московская обл', 'мо,', 'московская область'];
  return !regionWords.some(word => normalized.includes(word));
}

function buildReceipt(data) {
  const receipt = $('#receiptContent');
  const dimensions = state.type === 'custom' ? `Ширина: ${state.width} мм · Высота: ${state.height} мм` : 'Размер: стандартный набор';
  receipt.innerHTML = `
    <div class="receipt-row"><span>Зеркало</span><strong>${escapeHtml(state.name)}</strong></div>
    <div class="receipt-row"><span>Набор</span><strong>${typeLabel(state.type)}</strong></div>
    <div class="receipt-row"><span>Размер</span><strong>${dimensions}</strong></div>
    <div class="receipt-row"><span>Фамилия и имя</span><strong>${escapeHtml(data.surname)} ${escapeHtml(data.firstName)}</strong></div>
    <div class="receipt-row"><span>Телефон</span><strong>${escapeHtml(data.phone)}</strong></div>
    <div class="receipt-row"><span>Адрес</span><strong>${escapeHtml(data.address)}</strong></div>
    ${data.comment ? `<div class="receipt-row"><span>Комментарий</span><strong>${escapeHtml(data.comment)}</strong></div>` : ''}
  `;
  $('#receiptTotal').textContent = $('#totalPrice').textContent;
  $('#receiptNumber').textContent = `ЗАКАЗ №${String(state.orderNumber).padStart(6, '0')}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
}

$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    surname: $('#surname').value.trim(),
    firstName: $('#firstName').value.trim(),
    phone: $('#phone').value.trim(),
    address: $('#address').value.trim(),
    comment: $('#comment').value.trim()
  };
  if (!data.surname || !data.firstName || !data.phone || !data.address || !$('#consent').checked) {
    alert('Пожалуйста, заполните все обязательные поля и подтвердите согласие.');
    return;
  }
  if (!validMoscowAddress(data.address)) {
    alert('Сейчас мы принимаем заказы только по Москве, без Московской области. Проверьте адрес.');
    return;
  }
  buildReceipt(data);
  $('#receipt').classList.remove('hidden');
  $('#receipt').scrollIntoView({ behavior: 'smooth', block: 'start' });
  state.orderNumber += 1;
});

$('#printReceipt').addEventListener('click', () => window.print());
$('#backToCatalog').addEventListener('click', () => document.querySelector('#mirrors').scrollIntoView({ behavior: 'smooth' }));

window.addEventListener('resize', updatePreview);
updatePreview();
updatePrices();
