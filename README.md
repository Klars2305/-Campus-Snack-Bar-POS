# Campus Snack Bar POS — Stage 2

A desktop-friendly local POS interface built with plain HTML, CSS, and JavaScript. Products and cart data stay in browser memory; there is no database or external service dependency.

## Run

Open `index.html` in a modern browser. No installation or build step is required.

## Manual cart checks

1. Add Classic Burger twice. Expected: quantity 2, line subtotal ₱110.00, total ₱110.00, 2 items.
2. Add Soda (Can). Expected: total ₱135.00 and 3 items.
3. Press the burger minus button once. Expected: burger quantity 1, line subtotal ₱55.00, total ₱80.00.
4. Press minus until a row reaches zero. Expected: that row disappears and total recalculates; quantity never goes below zero.
5. Decrease the final cart item to zero. Expected: empty state and ₱0.00 total return.
6. Continue adding products and confirm each subtotal is price × quantity and the total is the sum of visible subtotals.

## Files

- `index.html` — POS interface structure
- `styles.css` — desktop-first and responsive styling
- `app.js` — in-memory cart, quantity updates, and calculations

Suggested commit: `feat: add POS cart quantity and total calculations`
