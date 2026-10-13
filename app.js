const products = [
  { id: 'classic-burger', name: 'Classic Burger', price: 55, icon: '🍔' },
  { id: 'cheeseburger', name: 'Cheeseburger', price: 65, icon: '🍔' },
  { id: 'ham-sandwich', name: 'Ham Sandwich', price: 40, icon: '🥪' },
  { id: 'fries', name: 'French Fries (Regular)', price: 45, icon: '🍟' },
  { id: 'nachos', name: 'Nachos', price: 50, icon: '🧀' },
  { id: 'soda', name: 'Soda (Can)', price: 25, icon: '🥤' },
];

const cart = new Map();
const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const productGrid = document.querySelector('#product-grid');
let isPaid = false;
let pendingPaymentCents = null;

function formatCents(cents) {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return peso.formatToParts(whole)
    .map((part) => part.type === 'fraction' ? fraction : part.value)
    .join('');
}

function getCartTotal() {
  return products.reduce((sum, product) => sum + product.price * (cart.get(product.id) || 0), 0);
}

function renderProducts() {
  productGrid.innerHTML = products.map((product) => `
    <button class="product-card" type="button" data-product-id="${product.id}" aria-label="Add ${product.name}, ${peso.format(product.price)}" ${isPaid ? 'disabled' : ''}>
      <span class="product-icon" aria-hidden="true">${product.icon}</span>
      <span class="product-name">${product.name}</span>
      <span class="product-price">${peso.format(product.price)}</span>
    </button>
  `).join('');
}

function changeQuantity(productId, amount) {
  const product = products.find((item) => item.id === productId);
  if (isPaid || !product || !Number.isSafeInteger(amount) || amount === 0) return;

  const currentQuantity = cart.get(productId) || 0;
  const nextQuantity = currentQuantity + amount;
  if (!Number.isSafeInteger(nextQuantity)) return;

  const nextTotal = products.reduce((sum, item) => {
    const quantity = item.id === productId ? Math.max(0, nextQuantity) : (cart.get(item.id) || 0);
    return sum + item.price * quantity;
  }, 0);
  if (!Number.isSafeInteger(nextTotal) || nextTotal > Math.floor(Number.MAX_SAFE_INTEGER / 100)) return;

  if (nextQuantity <= 0) cart.delete(productId);
  else cart.set(productId, nextQuantity);
  clearPaymentMessage();
  renderCart();
}

function renderCart() {
  const cartList = document.querySelector('#cart-list');
  const entries = products.filter((product) => cart.has(product.id));
  const itemCount = entries.reduce((sum, product) => sum + cart.get(product.id), 0);
  const total = getCartTotal();

  document.querySelector('#empty-state').hidden = entries.length > 0;
  document.querySelector('#cart-count').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  document.querySelector('#cart-total').textContent = peso.format(total);
  cartList.innerHTML = entries.map((product) => {
    const quantity = cart.get(product.id);
    return `
      <article class="cart-row">
        <div>
          <p class="cart-item-name">${product.name}</p>
          <span class="cart-item-price">${peso.format(product.price)} each</span>
        </div>
        <div class="cart-item-side">
          <span class="line-subtotal">${peso.format(product.price * quantity)}</span>
          <div class="quantity-control" aria-label="Quantity for ${product.name}">
            <button class="qty-button" type="button" data-change="-1" data-product-id="${product.id}" aria-label="Remove one ${product.name}" ${isPaid ? 'disabled' : ''}>−</button>
            <span class="quantity">${quantity}</span>
            <button class="qty-button" type="button" data-change="1" data-product-id="${product.id}" aria-label="Add one ${product.name}" ${isPaid ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelector('#cash-input').disabled = isPaid;
  document.querySelector('#pay-button').disabled = isPaid || entries.length === 0;
}

function clearPaymentMessage() {
  const message = document.querySelector('#payment-message');
  message.textContent = '';
  message.className = 'payment-message';
  document.querySelector('#cash-input').setAttribute('aria-invalid', 'false');
}

function showPaymentError(message) {
  const output = document.querySelector('#payment-message');
  output.textContent = message;
  output.className = 'payment-message';
  document.querySelector('#cash-input').setAttribute('aria-invalid', 'true');
}

function createTransactionReference() {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const suffix = Math.floor(Math.random() * 900000 + 100000);
  return `CSB-${timestamp}-${suffix}`;
}

function createReceipt(cashCents, changeCents, reference) {
  const entries = products.filter((product) => cart.has(product.id));
  const totalCents = getCartTotal() * 100;
  const rows = entries.map((product) => {
    const quantity = cart.get(product.id);
    const subtotalCents = product.price * quantity * 100;
    return `<div class="receipt-row"><span>${product.name} × ${quantity}</span><strong>${formatCents(subtotalCents)}</strong></div>`;
  }).join('');

  const receipt = document.querySelector('#receipt');
  receipt.innerHTML = `
    <h3 id="receipt-title">Campus Snack Bar</h3>
    <p class="receipt-reference">Transaction: ${reference}</p>
    <div class="receipt-items">${rows}</div>
    <div class="receipt-totals">
      <div class="receipt-total-row"><span>Total</span><strong>${formatCents(totalCents)}</strong></div>
      <div class="receipt-total-row"><span>Cash paid</span><strong>${formatCents(cashCents)}</strong></div>
      <div class="receipt-total-row grand"><span>Change</span><strong>${formatCents(changeCents)}</strong></div>
    </div>
    <p class="receipt-note">Payment confirmed. Thank you!</p>
  `;
  receipt.hidden = false;
}

function handlePayment(event) {
  event.preventDefault();
  if (isPaid) return;
  if (cart.size === 0) {
    showPaymentError('Add at least one product before accepting payment.');
    return;
  }

  const rawCash = document.querySelector('#cash-input').value.trim();
  if (!rawCash) {
    showPaymentError('Enter the cash amount received.');
    return;
  }
  const cashValue = Number(rawCash);
  if (!Number.isFinite(cashValue)) {
    showPaymentError('Enter a valid numeric cash amount.');
    return;
  }
  if (cashValue < 0) {
    showPaymentError('Cash amount cannot be negative.');
    return;
  }
  const cashCents = Math.round(cashValue * 100);
  if (!Number.isSafeInteger(cashCents)) {
    showPaymentError('Cash amount is too large. Enter a smaller amount.');
    return;
  }

  const totalCents = getCartTotal() * 100;
  if (cashCents < totalCents) {
    showPaymentError(`Insufficient payment. The total due is ${formatCents(totalCents)}.`);
    return;
  }

  const changeCents = cashCents - totalCents;
  if (!Number.isSafeInteger(changeCents)) {
    showPaymentError('Unable to calculate change for this amount.');
    return;
  }

  clearPaymentMessage();
  pendingPaymentCents = cashCents;
  document.querySelector('#confirm-total').textContent = formatCents(totalCents);
  document.querySelector('#confirm-cash').textContent = formatCents(cashCents);
  document.querySelector('#confirm-change').textContent = formatCents(changeCents);
  document.querySelector('#payment-confirmation').showModal();
}

function confirmPayment() {
  if (isPaid || pendingPaymentCents === null || cart.size === 0) return;
  const cashCents = pendingPaymentCents;
  const totalCents = getCartTotal() * 100;
  const changeCents = cashCents - totalCents;
  if (cashCents < totalCents || !Number.isSafeInteger(changeCents)) {
    document.querySelector('#payment-confirmation').close();
    showPaymentError('The order changed. Review the total and enter payment again.');
    return;
  }

  const reference = createTransactionReference();
  createReceipt(cashCents, changeCents, reference);
  const message = document.querySelector('#payment-message');
  message.textContent = `Payment confirmed. Change due: ${formatCents(changeCents)}.`;
  message.className = 'payment-message success';
  isPaid = true;
  document.querySelector('#new-transaction').hidden = false;
  renderProducts();
  renderCart();
  document.querySelector('#payment-confirmation').close();
  document.querySelector('#success-reference').textContent = `Reference: ${reference}`;
  document.querySelector('#transaction-success').showModal();
}

function startOrdering() {
  document.querySelector('#landing-page').hidden = true;
  document.querySelector('#pos-app').hidden = false;
  document.querySelector('#product-grid button')?.focus();
}

function showLanding() {
  document.querySelector('#pos-app').hidden = true;
  document.querySelector('#landing-page').hidden = false;
  document.querySelector('#start-ordering').focus();
}

function startNewTransaction() {
  cart.clear();
  isPaid = false;
  document.querySelector('#cash-input').value = '';
  document.querySelector('#receipt').innerHTML = '';
  document.querySelector('#receipt').hidden = true;
  document.querySelector('#new-transaction').hidden = true;
  clearPaymentMessage();
  renderProducts();
  renderCart();
  document.querySelector('#product-grid button')?.focus();
}

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-product-id]');
  if (button) changeQuantity(button.dataset.productId, 1);
});

document.querySelector('#cart-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-change]');
  if (button) changeQuantity(button.dataset.productId, Number(button.dataset.change));
});

document.querySelector('#payment-form').addEventListener('submit', handlePayment);
document.querySelector('#new-transaction').addEventListener('click', startNewTransaction);
document.querySelector('#start-ordering').addEventListener('click', startOrdering);
document.querySelector('#back-to-home').addEventListener('click', showLanding);
document.querySelector('#confirm-payment').addEventListener('click', confirmPayment);
document.querySelector('#cancel-payment').addEventListener('click', () => {
  document.querySelector('#payment-confirmation').close();
});
document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelector('#payment-confirmation').addEventListener('close', () => {
  pendingPaymentCents = null;
});
document.querySelector('#close-success').addEventListener('click', () => {
  document.querySelector('#transaction-success').close();
});
document.querySelector('#transaction-success').addEventListener('close', () => {
  document.querySelector('#new-transaction').focus();
});

renderProducts();
renderCart();
