# Campus Snack Bar POS — Stage 3

A desktop-friendly local POS built with plain HTML, CSS, and JavaScript. The menu and current transaction stay in browser memory. It uses cash only and has no database, login, inventory, online payment, or external service dependency.

## Run

Open `index.html` in a modern browser. No installation, server, or build step is required.

## End-to-end manual checks

1. Add two Classic Burgers and one Soda (Can). Expected: burger subtotal ₱110.00, soda subtotal ₱25.00, total ₱135.00.
2. Submit with the cash field blank. Expected: “Enter the cash amount received.” No receipt is created.
3. Enter nonnumeric text, then submit. Expected: a clear valid numeric amount message; no receipt is created. (Number fields may prevent typing nonnumeric characters in some browsers.)
4. Enter `-1`, then submit. Expected: a negative amount message; no receipt is created.
5. Enter `134.99`, then submit. Expected: insufficient payment message showing total due ₱135.00; no receipt is created.
6. Enter `200`, then submit. Expected: payment confirmation and a receipt listing both products, quantities, subtotals, total ₱135.00, cash paid ₱200.00, change ₱65.00, and a `CSB-...` transaction reference.
7. After payment, confirm cart and cash controls are locked. Select **New Transaction**. Expected: cart and receipt are cleared, cash field and message reset, total returns to ₱0.00, and product selection is enabled again.
8. Optional exact payment: create a ₱55.00 burger order and pay ₱55.00. Expected: change is ₱0.00.

## Files

- `index.html` — POS, payment form, receipt, and reset controls
- `styles.css` — desktop-friendly layout and checkout/receipt styling
- `app.js` — in-memory cart, payment validation, change calculation, receipt, and transaction reset

Suggested commit: `feat: complete cash checkout and digital receipts`
