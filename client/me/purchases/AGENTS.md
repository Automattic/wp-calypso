# Classic Purchases — Redirects & Shared Purchase Helpers

Account-level purchase management (the purchases list, purchase details,
cancellation, payment methods, billing history and tax details) lives in the
Dashboard under `client/dashboard/me/billing-purchases/`. The classic
`/me/purchases/*` and `/me/billing/*` routes registered in `index.js` only
redirect there so old links keep working.

What remains in this directory is shared by other classic Calypso surfaces
(domain and email management, plans, checkout, marketing-survey cancellation
dialogs), not by any page of its own. Don't add new purchase-management UI here;
build it in the Dashboard.

## Project Knowledge

### Directory Structure

```
client/me/purchases/
├── index.js + controller.js       # page.js redirects to the Dashboard
├── paths.js                       # Classic URLs, still linked from other sections
├── lib/raw-purchase-helpers.ts    # Helpers over the raw api-core `Purchase`
├── manage-purchase/auto-renew-toggle/ # Used by domain and email management
├── remove-purchase/               # Used by domain management
└── upcoming-renewals/             # Used by checkout
```

### Architecture Context

Everything here reads the raw `Purchase` type from `@automattic/api-core`
(snake_case fields, e.g. `purchase.site_slug`; expiry values `'auto-renewing'`,
`'manual-renew'`).

## Common Pitfalls

1. **Auto-renew toggle is asymmetric** — Enabling requires a valid payment method
   (silently shows dialog instead). Disabling has no such gate.

2. **Auto-renew toggle: deferred notice pattern** — Notices created while
   `showAutoRenewDisablingDialog` is visible get swallowed. The component uses
   `pendingNotice` state + `componentDidUpdate` to defer. Don't call `createNotice`
   directly in dialog callbacks.

3. **`site.wpcom_url` lies for `.home.blog` sites** — Always returns
   `.wordpress.com` even when the site's free domain is `.home.blog` (or 27
   other `.blog` subdomains). Use `getWpComDomainBySiteId()` selector to get
   the actual free domain. Affects `NonPrimaryDomainDialog` in `remove-purchase/`.

4. **`isMonthly()` only checks plan slugs** — Returns `false` for Jetpack
   product slugs like `jetpack_videopress_monthly` because it only checks
   `JETPACK_MONTHLY_PLANS`. Use `getJetpackItemTermVariants()` for products.
   Same issue with `getYearlyPlanByMonthly()` — only works for plans.

5. **Siteless purchases** — Some products (Akismet, Jetpack, Marketplace) use holding sites (`siteless.{jetpack|akismet|marketplace.wp|a4a}.com`). Never query site data for these — use `purchase.domain` for display, skip site-dependent UI entirely.

6. **Transferred purchases** — Always check ownership before allowing purchase actions.
