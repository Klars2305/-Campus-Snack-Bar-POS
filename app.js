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
let pendingTotalCents = null;

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
      <div class="product-badge-wrap">
        <span class="product-icon" aria-hidden="true">${product.icon}</span>
        <span class="product-tag">${product.price <= 45 ? 'Snack' : 'Popular'}</span>
      </div>
      <span class="product-name">${product.name}</span>
      <div class="product-bottom-row">
        <span class="product-price">${peso.format(product.price)}</span>
        <span class="add-indicator" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </span>
      </div>
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
        <div class="cart-item-details">
          <span class="cart-item-icon" aria-hidden="true">${product.icon}</span>
          <div>
            <p class="cart-item-name">${product.name}</p>
            <span class="cart-item-price">${peso.format(product.price)} each</span>
          </div>
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

  document.querySelectorAll('.quick-chip').forEach((btn) => {
    btn.disabled = isPaid || entries.length === 0;
  });
}

function clearPaymentMessage() {
  setPaymentMessage('', '');
}

function showPaymentError(message) {
  setPaymentMessage(message, 'error');
}

function showPaymentNotice(message) {
  setPaymentMessage(message, 'notice');
}

function showPaymentSuccess(message) {
  setPaymentMessage(message, 'success');
}

function setPaymentMessage(message, tone) {
  const output = document.querySelector('#payment-message');
  output.textContent = message;
  output.className = `payment-message${tone ? ` ${tone}` : ''}`;
  document.querySelector('#cash-input').setAttribute('aria-invalid', String(tone === 'error'));
}

function reportUnexpectedError(error, message) {
  console.error('[Campus Snack Bar POS]', error);
  showPaymentNotice(message);
}

function runSafely(action, message) {
  try {
    action();
  } catch (error) {
    reportUnexpectedError(error, message);
  }
}

function openDialog(dialog, label) {
  try {
    if (!dialog.open) dialog.showModal();
    return true;
  } catch (error) {
    console.error(`[Campus Snack Bar POS] Could not open ${label}.`, error);
    return false;
  }
}

function closeDialog(dialog, label) {
  try {
    if (dialog.open) dialog.close();
    return true;
  } catch (error) {
    console.error(`[Campus Snack Bar POS] Could not close ${label}.`, error);
    return false;
  }
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
    <div class="receipt-header">
      <div class="receipt-icon-badge" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-8"/><path d="M16 12h-8"/><path d="M10 16H8"/>
        </svg>
      </div>
      <h3 id="receipt-title">Campus Snack Bar</h3>
      <p class="receipt-reference">Ref: ${reference}</p>
    </div>
    <div class="receipt-items">${rows}</div>
    <div class="receipt-totals">
      <div class="receipt-total-row"><span>Total</span><strong>${formatCents(totalCents)}</strong></div>
      <div class="receipt-total-row"><span>Cash paid</span><strong>${formatCents(cashCents)}</strong></div>
      <div class="receipt-total-row grand"><span>Change</span><strong>${formatCents(changeCents)}</strong></div>
    </div>
    <p class="receipt-note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Payment confirmed. Thank you!</span>
    </p>
  `;
  receipt.hidden = false;
}

function validatePayment(rawCash, totalCents) {
  if (!rawCash) return { error: 'Enter the cash amount received.' };

  const cashValue = Number(rawCash);
  if (!Number.isFinite(cashValue)) return { error: 'Enter a valid numeric cash amount.' };
  if (cashValue < 0) return { error: 'Cash amount cannot be negative.' };

  const scaledCents = cashValue * 100;
  const cashCents = Math.round(scaledCents);
  if (!Number.isSafeInteger(cashCents)) return { error: 'Cash amount is too large. Enter a smaller amount.' };
  if (Math.abs(scaledCents - cashCents) > 1e-7) {
    return { error: 'Enter no more than two decimal places for cash.' };
  }
  if (cashCents < totalCents) {
    return { error: `Insufficient payment. The total due is ${formatCents(totalCents)}.` };
  }

  const changeCents = cashCents - totalCents;
  if (!Number.isSafeInteger(changeCents)) return { error: 'Unable to calculate change for this amount.' };
  return { cashCents, changeCents };
}

function handlePayment(event) {
  event.preventDefault();
  if (isPaid) {
    showPaymentNotice('This sale is already paid. Start a new transaction to continue.');
    return;
  }
  if (cart.size === 0) {
    showPaymentNotice('Add at least one product before accepting payment.');
    return;
  }
  if (document.querySelector('#payment-confirmation').open) {
    showPaymentNotice('Review or close the current payment confirmation before submitting again.');
    return;
  }

  const rawCash = document.querySelector('#cash-input').value.trim();
  const totalCents = getCartTotal() * 100;
  const payment = validatePayment(rawCash, totalCents);
  if (payment.error) {
    showPaymentError(payment.error);
    return;
  }

  try {
    clearPaymentMessage();
    pendingPaymentCents = payment.cashCents;
    pendingTotalCents = totalCents;
    document.querySelector('#confirm-total').textContent = formatCents(totalCents);
    document.querySelector('#confirm-cash').textContent = formatCents(payment.cashCents);
    document.querySelector('#confirm-change').textContent = formatCents(payment.changeCents);
    if (!openDialog(document.querySelector('#payment-confirmation'), 'payment review')) {
      pendingPaymentCents = null;
      pendingTotalCents = null;
      showPaymentNotice('Payment review could not open. No payment was recorded; please try again.');
    }
  } catch (error) {
    pendingPaymentCents = null;
    pendingTotalCents = null;
    reportUnexpectedError(error, 'Payment review could not be prepared. No payment was recorded; please try again.');
  }
}

function confirmPayment() {
  if (isPaid) {
    showPaymentNotice('This sale has already been paid.');
    return;
  }
  if (pendingPaymentCents === null || pendingTotalCents === null || cart.size === 0) {
    showPaymentNotice('Payment review expired. Review the order and submit payment again.');
    closeDialog(document.querySelector('#payment-confirmation'), 'payment review');
    return;
  }

  const cashCents = pendingPaymentCents;
  const totalCents = getCartTotal() * 100;
  if (totalCents !== pendingTotalCents) {
    showPaymentNotice('The order total changed. Review the order and submit payment again.');
    closeDialog(document.querySelector('#payment-confirmation'), 'payment review');
    return;
  }
  if (cashCents < totalCents) {
    showPaymentError(`Insufficient payment. The total due is ${formatCents(totalCents)}.`);
    closeDialog(document.querySelector('#payment-confirmation'), 'payment review');
    return;
  }
  const changeCents = cashCents - totalCents;
  if (!Number.isSafeInteger(changeCents)) {
    showPaymentNotice('Unable to calculate change. No payment was recorded.');
    closeDialog(document.querySelector('#payment-confirmation'), 'payment review');
    return;
  }

  let reference;
  try {
    reference = createTransactionReference();
    createReceipt(cashCents, changeCents, reference);
  } catch (error) {
    document.querySelector('#receipt').innerHTML = '';
    document.querySelector('#receipt').hidden = true;
    reportUnexpectedError(error, 'The receipt could not be prepared. No payment was recorded; please try again.');
    return;
  }

  if (!closeDialog(document.querySelector('#payment-confirmation'), 'payment review')) {
    document.querySelector('#receipt').innerHTML = '';
    document.querySelector('#receipt').hidden = true;
    showPaymentNotice('Payment review could not close. No payment was recorded; use Escape or the close control to try again.');
    return;
  }

  isPaid = true;
  pendingPaymentCents = null;
  pendingTotalCents = null;
  document.querySelector('#new-transaction').hidden = false;
  showPaymentSuccess(`Payment confirmed. Change due: ${formatCents(changeCents)}.`);
  try {
    renderProducts();
    renderCart();
  } catch (error) {
    reportUnexpectedError(error, 'Payment was recorded. The receipt is ready, but the order controls could not refresh.');
  }

  document.querySelector('#success-reference').textContent = `Reference: ${reference}`;
  if (!openDialog(document.querySelector('#transaction-success'), 'success message')) {
    showPaymentSuccess('Payment recorded. Your receipt is ready in the order summary.');
  }
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
  pendingPaymentCents = null;
  pendingTotalCents = null;
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
  runSafely(() => {
    const button = event.target.closest('[data-product-id]');
    if (button) changeQuantity(button.dataset.productId, 1);
  }, 'The order view could not refresh. Check the displayed quantity before adding more products.');
});

document.querySelector('#cart-list').addEventListener('click', (event) => {
  runSafely(() => {
    const button = event.target.closest('[data-change]');
    if (button) changeQuantity(button.dataset.productId, Number(button.dataset.change));
  }, 'The order view could not refresh. Check the displayed quantities before continuing.');
});

document.querySelector('#payment-form').addEventListener('submit', (event) => {
  runSafely(() => handlePayment(event), 'Payment could not be prepared. Your order has not been paid; please try again.');
});

document.querySelector('#cash-input').addEventListener('input', () => {
  runSafely(clearPaymentMessage, 'Cash input feedback could not be updated.');
});

document.querySelector('#quick-cash-row')?.addEventListener('click', (event) => {
  runSafely(() => {
    const chip = event.target.closest('.quick-chip');
    if (!chip || chip.disabled) return;
    const cashInput = document.querySelector('#cash-input');
    if (chip.dataset.cashAction === 'exact') {
      const total = getCartTotal();
      cashInput.value = total > 0 ? total.toFixed(2) : '';
    } else if (chip.dataset.cashAmount) {
      cashInput.value = Number(chip.dataset.cashAmount).toFixed(2);
    }
    clearPaymentMessage();
    cashInput.focus();
  }, 'Quick cash value could not be applied.');
});

document.querySelector('#new-transaction').addEventListener('click', () => {
  runSafely(startNewTransaction, 'The new transaction could not be started. Please try again.');
});

document.querySelector('#start-ordering').addEventListener('click', () => {
  runSafely(startOrdering, 'Ordering could not be opened. Please try again.');
});

document.querySelector('#back-to-home').addEventListener('click', () => {
  runSafely(showLanding, 'The welcome page could not be opened. Please try again.');
});

document.querySelector('#confirm-payment').addEventListener('click', () => {
  runSafely(confirmPayment, 'Payment status could not be updated. Check the order and receipt before retrying.');
});

document.querySelector('#cancel-payment').addEventListener('click', () => {
  if (!closeDialog(document.querySelector('#payment-confirmation'), 'payment review')) {
    showPaymentNotice('The payment review could not close. Use Escape or the close control.');
  }
});

document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => {
    runSafely(() => {
      const dialog = button.closest('dialog');
      if (!dialog) throw new Error('Modal close control is not inside a dialog.');
      if (!closeDialog(dialog, 'dialog')) showPaymentNotice('The dialog could not close. Press Escape to dismiss it.');
    }, 'The dialog could not close. Press Escape to dismiss it.');
  });
});

document.querySelector('#payment-confirmation').addEventListener('close', () => {
  pendingPaymentCents = null;
  pendingTotalCents = null;
});

document.querySelector('#close-success').addEventListener('click', () => {
  if (!closeDialog(document.querySelector('#transaction-success'), 'success message')) {
    showPaymentNotice('The confirmation could not close. Press Escape to dismiss it.');
  }
});

document.querySelector('#transaction-success').addEventListener('close', () => {
  runSafely(() => document.querySelector('#new-transaction').focus(), 'Focus could not return to the transaction controls.');
});

runSafely(() => {
  renderProducts();
  renderCart();
}, 'The register could not be initialized. Reload the page to try again.');
