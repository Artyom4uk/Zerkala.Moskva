const state = {
  type: 'doorStandard',
  name: 'Зеркало на входную дверь — Стандарт с глазком',
  width: 1600,
  height: 630,
  orderNumber: Number(localStorage.getItem('zerkalyeOrderNumber') || '1'),
  price: 8000
};

const API_URL = 'https://zerkala-api.artgusfake10042013.workers.dev';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const products = {
  doorStandard: { label: 'Стандарт с глазком', width: 1600, height: 630, price: 8000, turnkey: true },
  doorStandardPlus: { label: 'Стандарт+ с глазком', width: 1800, height: 630, price: 9000, turnkey: true },
  doorCustom: { label: 'Нестандарт', width: 2000, height: 630, price: null, custom: true },
  interiorSimple: { label: 'Простое интерьерное', width: 1000, height: 1800, price: null, custom: true },
  interiorLight: { label: 'Интерьерное с подсветкой', width: 1000, height: 1800, price: null, custom: true },
  interiorCustom: { label: 'Интерьерное нестандартное', width: 1000, height: 1800, price: null, custom: true },
  cabinet: { label: 'На шкаф', width: 600, height: 1800, price: null, custom: true },
  shelf: { label: 'На полку', width: 600, height: 400, price: null, custom: true },
  custom: { label: 'Нестандарт', width: 1000, height: 1000, price: null, custom: true }
};

function formatPrice(value) {
  if (value === null || value === undefined) return 'По запросу';
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function typeLabel(type) {
  if (type === 'doorStandard') return 'Входная дверь · Стандарт';
  if (type === 'doorStandardPlus') return 'Входная дверь · Стандарт+';
  if (type === 'doorCustom') return 'Входная дверь · Нестандарт';
  if (type === 'interiorSimple') return 'Интерьер · Простое';
  if (type === 'interiorLight') return 'Интерьер · С подсветкой';
  if (type === 'interiorCustom') return 'Интерьер · Нестандарт';
  if (type === 'cabinet') return 'Шкафы';
  if (type === 'shelf') return 'Полки';
  return 'Нестандарт';
}

function dimensionsLabel() {
  return `${state.width} × ${state.height} мм`;
}

function updatePreview() {
  const mirror = $('#bigMirror');
  const width = Math.max(100, Math.min(5000, Number(state.width) || 1000));
  const height = Math.max(100, Math.min(5000, Number(state.height) || 1000));
  const ratio = width / height;
  const maxWidth = window.innerWidth <= 760 ? 230 : 290;
  const maxHeight = window.innerWidth <= 760 ? 310 : 410;
  let visualW = Math.sqrt(ratio) * 240;
  let visualH = visualW / ratio;
  if (visualH > maxHeight) { visualH = maxHeight; visualW = visualH * ratio; }
  if (visualW > maxWidth) { visualW = maxWidth; visualH = visualW / ratio; }
  mirror.style.width = `${Math.max(100, visualW)}px`;
  mirror.style.height = `${Math.max(120, visualH)}px`;
  mirror.style.borderRadius = '0';
  $('#selectedTitle').textContent = state.name;
  $('#formOrderName').textContent = `${state.name} · ${dimensionsLabel()}`;
  $('#previewCaption').textContent = `Предпросмотр: ${dimensionsLabel()}. Пропорции условные.`;
}

function updatePrices() {
  $('#mirrorPrice').textContent = formatPrice(state.price);
  $('#totalPrice').textContent = formatPrice(state.price);
  $('#formOrderPrice').textContent = formatPrice(state.price);
}

function setType(type, name) {
  const product = products[type] || products.custom;
  state.type = type;
  state.name = name || state.name;
  state.width = product.width;
  state.height = product.height;
  state.price = product.price;

  $$('#setSelector button').forEach(btn => btn.classList.toggle('selected', btn.dataset.type === type));

  const isCustom = product.custom || type === 'custom';
  $('#dimensions').style.opacity = '1';
  $('#widthInput').value = state.width;
  $('#heightInput').value = state.height;
  $('#widthInput').readOnly = !isCustom;
  $('#heightInput').readOnly = !isCustom;
  $('#dimensionHelp').textContent = isCustom
    ? 'Укажите размеры в миллиметрах. Точные допустимые пределы и стоимость нестандартного варианта уточняются у владельца.'
    : `Подтверждённый размер: ${state.width} × ${state.height} мм. Стоимость указана под ключ.`;

  updatePreview();
  updatePrices();
}

function updateStaticDimensions() {
  $$('.mirror-card p, #formOrderName').forEach(el => {
    el.textContent = el.textContent
      .replace('160 × 63 см', '1600 × 630 мм')
      .replace('180 × 63 см', '1800 × 630 мм');
  });
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
      const types = card.dataset.type.split(' ');
      card.style.display = types.includes(filter) ? '' : 'none';
    });
    document.querySelector('#mirrors').scrollIntoView({ behavior: 'smooth' });
  });
});

$('#widthInput').addEventListener('input', e => { if (!e.target.readOnly) { state.width = Number(e.target.value); updatePreview(); updatePrices(); } });
$('#heightInput').addEventListener('input', e => { if (!e.target.readOnly) { state.height = Number(e.target.value); updatePreview(); updatePrices(); } });

$('#resetConfig').addEventListener('click', () => {
  setType('doorStandard', 'Зеркало на входную дверь — Стандарт с глазком');
});

$('#startOrder').addEventListener('click', () => {
  document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => $('#surname').focus(), 450);
});

function validMoscowAddress(value) {
  const normalized = value.toLowerCase().replace(/ё/g, 'е').trim();
  const regionWords = ['московская область', 'московская обл', 'мо,', 'область,', 'г. химки', 'химки,', 'мытищи', 'красногорск', 'одинцово', 'балашиха', 'подольск', 'люберцы', 'королев', 'домодедово', 'видное', 'реутов'];
  return !regionWords.some(word => normalized.includes(word));
}

function buildReceipt(data, orderNumber) {
  const receipt = $('#receiptContent');
  const product = products[state.type] || products.custom;
  const dimensions = `${state.width} × ${state.height} мм`;
  receipt.innerHTML = `
    <div class="receipt-row"><span>Зеркало</span><strong>${escapeHtml(state.name)}</strong></div>
    <div class="receipt-row"><span>Категория</span><strong>${typeLabel(state.type)}</strong></div>
    <div class="receipt-row"><span>Размер</span><strong>${dimensions}</strong></div>
    <div class="receipt-row"><span>Комплектация</span><strong>${product.turnkey ? 'Под ключ' : 'Уточняется'}</strong></div>
    <div class="receipt-row"><span>Фамилия и имя</span><strong>${escapeHtml(data.surname)} ${escapeHtml(data.firstName)}</strong></div>
    <div class="receipt-row"><span>Телефон</span><strong>${escapeHtml(data.phone)}</strong></div>
    <div class="receipt-row"><span>Адрес</span><strong>${escapeHtml(data.address)}</strong></div>
    ${data.comment ? `<div class="receipt-row"><span>Комментарий</span><strong>${escapeHtml(data.comment)}</strong></div>` : ''}
  `;
  $('#receiptTotal').textContent = formatPrice(state.price);
  $('#receiptNumber').textContent = `ЗАКАЗ №${escapeHtml(orderNumber)}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch]));
}

$('#orderForm').addEventListener('submit', async e => {
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
    alert('Заказы принимаются только по Москве, без Московской области. Проверьте адрес.');
    return;
  }

  const submitButton = $('#orderForm button[type="submit"]');
  const originalText = submitButton ? submitButton.textContent : '';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Оформляем заказ…';
  }

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        surname: data.surname,
        name: data.firstName,
        phone: data.phone,
        address: data.address,
        comment: data.comment,
        mirror: state.name,
        category: typeLabel(state.type),
        packageType: products[state.type]?.turnkey ? 'Под ключ' : 'Уточняется',
        widthMm: state.width,
        heightMm: state.height,
        priceRub: state.price
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Сервер не принял заказ');
    }

    buildReceipt(data, result.orderNumber);
    $('#receipt').classList.remove('hidden');
    $('#receipt').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error(error);
    alert('Не удалось оформить заказ. Проверьте интернет-соединение и попробуйте ещё раз.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
});

$('#printReceipt').addEventListener('click', () => window.print());
$('#backToCatalog').addEventListener('click', () => document.querySelector('#mirrors').scrollIntoView({ behavior: 'smooth' }));

/* Force the product previews to remain rectangular even if an older cached CSS rule is loaded. */
function forceRectangularMirrors() {
  $$('.mirror-shape, .mini-mirror, .big-mirror').forEach(el => {
    el.style.setProperty('border-radius', '0px', 'important');
  });
  const mark = $('.brand-mark');
  if (mark) {
    mark.textContent = '';
    mark.style.transform = 'none';
    mark.style.background = "url('assets/zazerkalie-logo.svg') center/contain no-repeat";
    mark.style.width = '42px';
    mark.style.height = '42px';
  }
}

window.addEventListener('resize', () => { updatePreview(); forceRectangularMirrors(); });
updateStaticDimensions();
updatePreview();
updatePrices();
forceRectangularMirrors();