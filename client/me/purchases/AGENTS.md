# Classic Purchases — Billing & Purchase Management

Redux/page.js-based billing and purchase management. Covers the full purchase
lifecycle: listing, detail, payment methods, billing history, cancellation, and
tax details. Related billing areas: `client/dashboard/me/billing-purchases/`
(Dashboard), `client/my-sites/checkout/` (Checkout).

## Project Knowledge

### Directory Structure

```
client/me/purchases/
├── index.js + controller.jsx       # page.js route registration (not React Router)
├── manage-purchase/
│   └── index.tsx                   # Main detail page — class component (not functional)
├── purchases-list-in-dataviews/    # Modern DataViews list (retrofitted into Redux architecture)
├── cancel-purchase/                # Cancel flow — separate from remove-purchase/
├── remove-purchase/                # Remove flow (expired items, DELETE API) — separate from cancel
└── billing-history/main.tsx        # DataViews-based history list
```

### Redux Selectors

`getSitePurchases(state, siteId)` returns `[]` when not loaded — indistinguishable
from "no purchases." `getUserPurchases(state)` returns `null` when not loaded.
Always check `hasLoadedUserPurchasesFromServer` / `hasLoadedSitePurchasesFromServer`
before trusting results.

`getByPurchaseId` searches ALL purchases (user + site) from a single flat array.
What's in that array depends on which `Query*Purchases` components have mounted.

### Architecture Context

Classic uses `Purchase` from `calypso/lib/purchases/types` (camelCase fields, e.g.,
`purchase.siteSlug`). Expiry values: `'autoRenewing'`, `'manualRenew'`. Dashboard
(`client/dashboard/me/billing-purchases/`) uses a different `Purchase` type from
`@automattic/api-core` (snake_case, different string values) — never copy logic
between the two without converting field names and values.

## Architectural Decisions

1. **Two cancel paths (mutually exclusive)** — `manage-purchase/index.tsx` renders one
   of two cancel entry points based on `canAutoRenewBeTurnedOff(purchase)`:

   - **True** → `renderCancelPurchaseNavItem()` → navigates to cancel page (full flow)
   - **False** → `renderRemovePurchaseNavItem()` → renders `<RemovePurchase>` inline (delete)

   These map to different API calls (`cancelPurchase` for refund, `removePurchase`
   DELETE for expired, `disableAutoRenew` for toggle). All say "Cancel" in the UI
   but are NOT interchangeable.

2. **Three payment method paths** — `changePaymentMethod` (per-purchase, has card),
   `addPaymentMethod` (per-purchase, no card), `addNewPaymentMethod` (account-level).
   Different routes, different components. `getChangePaymentMethodPath` in `utils.ts`
   chooses between the first two.

3. **Auto-renew toggle is asymmetric** — Enabling requires a valid payment method
   (silently shows dialog instead). Disabling has no such gate.

## Common Pitfalls

1. **`canAutoRenewBeTurnedOff` name lies** — Despite the name, this function is the
   **cancel eligibility gate**, not an auto-renew check. Returns `true` for refundable
   purchases even when auto-renew is already off. See `client/lib/purchases/index.ts`.
   Don't substitute `purchase.isAutoRenewEnabled`.

2. **`isSiteLevel` prop changes data source silently** — In `manage-purchase`,
   `isSiteLevel=true` checks `hasLoadedSitePurchasesFromServer` instead of
   `hasLoadedUserPurchasesFromServer`. Without the matching `QuerySitePurchases`
   component, you get a permanent loading state with no error.

3. **Auto-renew toggle: deferred notice pattern** — Notices created while
   `showAutoRenewDisablingDialog` is visible get swallowed. The component uses
   `pendingNotice` state + `componentDidUpdate` to defer. Don't call `createNotice`
   directly in dialog callbacks.

4. **`page()` vs `page.redirect()` after actions** — Use `page.redirect()` after
   cancel/remove so users can't navigate back to an invalid state. `page()` is
   for normal navigation.

5. **`purchase` is optional in PaymentMethodSelector** — The "add payment method"
   flow passes `undefined`. Processors must handle this case. Success messages
   branch on whether `purchase` exists.

6. **`site.wpcom_url` lies for `.home.blog` sites** — Always returns
   `.wordpress.com` even when the site's free domain is `.home.blog` (or 27
   other `.blog` subdomains). Use `getWpComDomainBySiteId()` selector to get
   the actual free domain. Affects `NonPrimaryDomainDialog` in both
   `remove-purchase/` and `manage-purchase/`.

7. **`isMonthly()` only checks plan slugs** — Returns `false` for Jetpack
   product slugs like `jetpack_videopress_monthly` because it only checks
   `JETPACK_MONTHLY_PLANS`. Use `getJetpackItemTermVariants()` for products.
   Same issue with `getYearlyPlanByMonthly()` — only works for plans.

8. **VAT API errors need field mapping** — `useMutation` error has
   `{ error: string, message: string }` but no field indicator. Map error
   codes to fields: `missing_country`/`invalid_country` → country field,
   `invalid_vat`/`missing_id`/`validation_failed` → id field.

9. **Siteless purchases** — Some products (Akismet, Jetpack, Marketplace) use temporary sites (`siteless.{jetpack|akismet|marketplace.wp|a4a}.com`). Guard with `isTemporarySitePurchase()`. Never query site data for these — use `purchase.domain` for display, skip site-dependent UI entirely.

10. **Transferred purchases** — Always check ownership before allowing purchase actions.
