# Campus Snack Bar POS — Stage 4

A desktop-friendly local POS built with plain HTML, CSS, and JavaScript. It includes a welcome page, in-memory product cart, cash-only checkout, digital receipt, and transaction reset. No installation, build step, database, or external service is required.

## Run

Open `index.html` in a modern browser and choose **Start Ordering**.

## HCI improvements

- **Consistency and simplicity:** the landing page and register share the same colors, typography, and button styles.
- **Visibility and feedback:** cart count, totals, payment errors, payment confirmation, and receipt are clearly shown.
- **Error prevention:** payment details are reviewed in a confirmation dialog before a sale is recorded; paid cart controls lock until a new transaction starts.
- **Accessibility:** semantic headings and labels, live status messages, invalid-state feedback on the cash field, visible keyboard focus, native modal dialogs, close buttons, and Escape-to-close support.
- **Clear navigation:** Start Ordering opens the register; Home returns to the landing page while preserving the in-memory sale.

## Manual UI and modal checks

1. Open the page. Expected: welcome landing page with **Start Ordering**. Tab to the button and press Enter; expected: register opens and focus moves to the first product.
2. Use **Home**, then **Start Ordering** again. Expected: navigation works and the in-memory sale is preserved.
3. Add two Classic Burgers and one Soda. Expected: subtotals ₱110.00 and ₱25.00; total ₱135.00. Increase and decrease quantities and confirm the figures update.
4. Try blank, nonnumeric, negative, and insufficient cash. Expected: a clear message for each; no confirmation dialog or receipt appears. Some number fields prevent nonnumeric characters from being typed.
5. Enter `200` and select **Pay**. Expected: payment confirmation dialog shows total ₱135.00, cash ₱200.00, and change ₱65.00. Choose **Keep Editing**; expected: no payment is recorded and the cart remains editable.
6. Submit the same payment again. In the dialog, use Tab and Shift+Tab to move through controls; press Escape or use the close button. Expected: dialog closes without recording payment. Submit again and select **Confirm Payment**.
7. Expected: transaction success dialog appears with a reference; close it with **Done**, its close button, or Escape. The receipt remains in the order summary with products, quantities, subtotals, total, cash, change, and transaction reference.
8. Select **New Transaction**. Expected: cart, cash field, receipt, and payment message clear; total returns to ₱0.00 and ordering is enabled.
9. Resize to a narrow or short window. Expected: controls and dialogs remain usable; keyboard focus remains visible.

## Files

- `index.html` — landing page, register, payment confirmation dialog, and success dialog
- `styles.css` — consistent desktop-friendly styling, responsive layout, and visible focus states
- `app.js` — in-memory cart, validation, dialogs, receipt, navigation, and reset behavior

Suggested commit: `feat: add landing page and accessible checkout dialogs`
