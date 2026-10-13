# Campus Snack Bar POS — Modern Aesthetic Purple Edition

A desktop- and laptop-friendly local POS built with standard HTML5, CSS3, and modern vanilla JavaScript. Features a modern aesthetic purple theme with lavender gradients, sleek card surfaces, crisp inline SVG icons, quick-cash helpers, in-memory product cart, cash-only checkout, digital receipt, and complete transaction reset. No installation, build step, database, or external network dependencies are required.

## Quick Start

Open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari) and choose **Start Ordering**.

## Visual Design & HCI Enhancements

- **Aesthetic Purple Color Palette**: Harmonious palette blending deep royal violet (`#5b21b6`, `#6d28d9`), vibrant violet accents (`#7c3aed`), soft lavender backgrounds (`#f6f5fc`, `#ede9fe`), and white cards (`#ffffff`).
- **Modern Minimalist Surface Design**: 16px to 22px rounded corners, layered drop shadows, smooth 1px borders (`#e4e1f7`), and soft radial gradient ambient glow.
- **Integrated Icons**: Crisp, resolution-independent inline SVG icons for navigation (Home, Register status), catalog headings, product cards, order summary, cart item thumbnails, payment label, quick cash presets, digital receipt, and modal dialog actions.
- **Micro-Interactions & States**: Smooth hover card lifts (`-3px`), button gradient hover transitions, active press effects, and accessible keyboard focus rings (`:focus-visible`).
- **HCI Principles**:
  - *Visibility of System Status*: Real-time cart count badge, live order totals, animated status pulse indicator, and contextual status banners.
  - *Error Prevention & Clarity*: Disabled states for invalid actions, high-contrast accessible color combinations (WCAG AAA compliant for deep indigo text), and clear validation messages.
  - *Recognition Over Recall*: Visual food icons and thumbnail tags on both menu cards and cart line items.
  - *Accessibility*: Complete keyboard navigability (Tab/Shift+Tab, Enter, Escape), ARIA landmarks, `aria-live` announcements, and `prefers-reduced-motion` support.

## Regression and Manual UI Testing Checklist

1. **Landing Page**:
   - Open `index.html`.
   - Verify the modern hero card with purple gradient header, feature pills, and "Start Ordering" CTA button.
   - Press Enter or click **Start Ordering**; verify the POS register workspace opens and initial focus moves to the first menu item.
2. **Navigation & In-Memory State**:
   - Click **Home** in the topbar; verify the landing page appears.
   - Click **Start Ordering** again; verify navigation works smoothly and previously added cart items are preserved.
3. **Cart Operations**:
   - Click **Classic Burger** (₱55.00) twice and **Soda (Can)** (₱25.00) once.
   - Verify subtotals: ₱110.00 and ₱25.00, and grand total: ₱135.00.
   - Use the `+` and `−` quantity buttons in the order summary; verify count, line subtotals, and total calculate accurately.
4. **Validation & Error Handling**:
   - Test blank, negative, and nonnumeric cash inputs.
   - Verify red alert feedback banner and `aria-invalid="true"` visual outline.
   - Test entering insufficient cash (e.g., `50` when total is `135`); verify the explicit insufficiency error message.
5. **Quick-Cash Presets & Payment Review**:
   - Click the `₱200` quick-cash preset chip or enter `200` manually in the cash input.
   - Click **Pay**; verify the **Confirm Cash Payment** modal appears with Order Total (₱135.00), Cash Received (₱200.00), and Change Due (₱65.00).
   - Click **Keep Editing** or press Escape; verify the modal dismisses without executing the transaction and the cart remains editable.
6. **Payment Confirmation & Receipt**:
   - Click **Pay** and select **Confirm Payment**.
   - Verify the **Thank you!** success modal displays with the unique transaction reference.
   - Dismiss the modal using **Done**, Escape, or the close `✕` button.
   - Verify the official digital receipt remains visible with itemized breakdown, total, cash paid, change due, and reference.
   - Verify the product cards, quantity buttons, and cash inputs are disabled to prevent duplicate payments.
7. **Reset / New Transaction**:
   - Click **New Transaction**; verify cart resets to empty state, cash input clears, receipt hides, total resets to ₱0.00, and product buttons are re-enabled.
8. **Responsive Alignment**:
   - Test on wide screens (desktop: 3-column catalog + sticky order panel).
   - Test on laptop/tablet viewports (2-column catalog).
   - Test on mobile viewports (stacked 1-column layout).

## Files

- `index.html` — Semantic HTML5 structure with modern landing page, POS workspace, SVG icons, and accessible native `<dialog>` modals.
- `styles.css` — Complete design system with purple/lavender variables, elevation shadows, transitions, typography, and responsive media queries.
- `app.js` — In-memory cart state, monetary arithmetic, safe cash validation, dialog lifecycle, quick-cash chips, and transaction reset.

## Suggested Git Commit

`feat: redesign POS with modern aesthetic purple theme and icons`
