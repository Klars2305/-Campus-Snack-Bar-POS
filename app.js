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

function renderProducts() {
  productGrid.innerHTML = products.map((product) => `
    <button class="product-card" type="button" data-product-id="${product.id}" aria-label="Add ${product.name}, ${peso.format(product.price)}">
      <span class="product-icon" aria-hidden="true">${product.icon}</span>
      <span class="product-name">${product.name}</span>
      <span class="product-price">${peso.format(product.price)}</span>
    </button>
  `).join('');
}

function changeQuantity(productId, amount) {
  const product = products.find((item) => item.id === productId);
  if (!product || !Number.isSafeInteger(amount) || amount === 0) return;

  const currentQuantity = cart.get(productId) || 0;
  const nextQuantity = currentQuantity + amount;
  if (!Number.isSafeInteger(nextQuantity)) return;

  if (nextQuantity <= 0) cart.delete(productId);
  else cart.set(productId, nextQuantity);
  renderCart();
}

function renderCart() {
  const cartList = document.querySelector('#cart-list');
  const entries = products.filter((product) => cart.has(product.id));
  const itemCount = entries.reduce((sum, product) => sum + cart.get(product.id), 0);
  const total = entries.reduce((sum, product) => sum + product.price * cart.get(product.id), 0);

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
            <button class="qty-button" type="button" data-change="-1" data-product-id="${product.id}" aria-label="Remove one ${product.name}">−</button>
            <span class="quantity">${quantity}</span>
            <button class="qty-button" type="button" data-change="1" data-product-id="${product.id}" aria-label="Add one ${product.name}">+</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-product-id]');
  if (button) changeQuantity(button.dataset.productId, 1);
});

document.querySelector('#cart-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-change]');
  if (button) changeQuantity(button.dataset.productId, Number(button.dataset.change));
});

renderProducts();
renderCart();
