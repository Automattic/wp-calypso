# Dashboard Billing — Purchase Management

TanStack Query/Router-based billing and purchase management. The largest and most
complex billing area in the Dashboard client. Related billing areas:
`client/me/purchases/` (Classic), `client/my-sites/checkout/` (Checkout).

## Project Knowledge

### Directory Structure

```
billing-purchases/
├── index.tsx + dataviews.tsx     # Purchase list (DataViews table)
├── purchase-settings/index.tsx   # Heavy component — see Arch Decision #2
├── cancel-purchase/              # Multi-step cancellation flow (most complex area)
│   ├── cancel-purchase-form/     # Survey steps, product-specific options
│   └── domain-removal-flow       # Domain-specific removal steps
├── payment-methods/              # use-create-* factory hooks (one per payment type)
├── payment-method-selector/      # Payment method selection UI
├── change-payment-method.tsx     # Per-purchase payment method change
└── add-payment-method.tsx        # Standalone new card addition
```

### Sibling Billing Areas

Non-obvious details about sibling directories under `client/dashboard/me/`:

| Directory                  | Trap                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| `billing-payment-methods/` | Delete dialog queries `userPurchasesQuery()` to show affected subscriptions      |
| `billing-tax-details/`     | Read-only when `can_user_edit === false` — no error, just silently disables form |

### Data Layer

Helpers in `client/dashboard/utils/purchase.ts` (~50 functions). Queries are loaded
via router loaders in `client/dashboard/app/router/me.tsx`.

### Architecture Context

Dashboard uses `Purchase` from `@automattic/api-core` (snake_case fields, e.g.,
`purchase.site_slug`). Expiry values: `'auto-renewing'`, `'manual-renew'`. Classic
(`client/me/purchases/`) uses a different `Purchase` type from
`calypso/lib/purchases/types` (camelCase, different string values) — never copy
logic between the two without converting field names and values.

Query key prefix for purchases is `'upgrades'` (NOT `'purchases'` — historical).
Receipts use `'receipt'`, payment methods use `'me'`. Wrong prefix silently breaks
cache invalidation.

Queries live in `@automattic/api-queries` (`packages/api-queries/`), NOT in
`client/dashboard/data/` or `client/dashboard/app/queries/`. Adding a new query
requires a fetcher in `@automattic/api-core` (`packages/api-core/src/`) first,
then a query wrapper in `api-queries`.

## Architectural Decisions

1. **Purchase list uses DataViews** — `dataviews.tsx` defines fields, filters, actions,
   and responsive column visibility via `usePersistentView()`. Transferred purchases
   are fetched separately and disable management actions.

2. **Purchase settings is a heavy component** — Single `index.tsx` handles domain queries,
   storage queries, auto-renew state, renewal dialogs, and product-specific key displays.
   This is intentional consolidation, not a candidate for splitting.

3. **Payment method factory pattern** — `use-create-*` hooks return `PaymentMethod` objects
   with processors. `use-create-assignable-payment-methods.tsx` filters by
   `allowedPaymentMethodsQuery()` and returns empty array while loading (intentional).

### Cancel Purchase Flow

Three flow types, derived by `getPurchaseCancellationFlowType()` in
`utils/purchase.ts` from `is_refundable`, `hasAmountAvailableToRefund()`, and
`is_auto_renew_enabled` (not passed as props):

| Flow Type            | When                                                          | API Call                            |
| -------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `REMOVE`             | Expired, grace-period, or (not refundable AND auto-renew off) | `removePurchaseMutation()` (DELETE) |
| `CANCEL_WITH_REFUND` | Refundable, amount > 0, auto-renew on                         | `cancelAndRefundPurchaseMutation()` |
| `CANCEL_AUTORENEW`   | Not refundable, auto-renew on                                 | Turns off auto-renew                |

Survey steps vary by product type (Jetpack, domains, plans, Akismet, marketplace).
Agency partner purchases skip survey. Marketplace plan cancellation cascades to all
marketplace subscriptions on site.

## Common Pitfalls

1. **`isPartnerPurchase` type guard narrows to wrong field** — Checks
   `purchase?.partner_name` but narrows the type to `{ partnerType: string }` (camelCase).
   The actual field on the `Purchase` interface is `partner_type` (snake_case). Downstream
   code using the narrowed type will reference a field that doesn't exist.

2. **Payment method list is empty while loading** — `allowedPaymentMethods === undefined`
   returns `[]` (no methods shown). Errors fail open (all methods shown). Don't add
   conditional logic before the undefined guard in `use-create-assignable-payment-methods.tsx`.

3. **`REMOVE` and `CANCEL` are different APIs** — `getPurchaseCancellationFlowType`
   returns `REMOVE` for expired purchases, which maps to a DELETE call, not a cancel.
   Don't assume all paths through "cancel purchase" call the same mutation.

4. **Bundled purchases are Remove-only** — A purchase with `expiry_status === 'included'`
   renews with its parent plan, so `is_auto_renew_enabled` says nothing useful about it and
   disabling auto-renew is a no-op. Never offer Cancel for one. Only domain connections
   (`domain_map`) can be removed on their own; the rest of a plan's bundle goes with the plan.
   See `CancelOrRemoveActionButton` in `purchase-settings/index.tsx`.

5. **CRITICAL: `flowType` gets silently overridden** — Inside `onSurveyComplete()`,
   `state.cancelIntent === 'refund'` switches `CANCEL_AUTORENEW` → `CANCEL_WITH_REFUND`.
   The `shouldShowRefundEligibilityNotice` feature flag also changes the default path.

6. **Survey completion tracked per-purchase** — Stored in user preferences to avoid
   re-surveying. A new survey won't appear for a purchase that was already surveyed.

7. **Siteless purchases** — Some products (Akismet, Jetpack, Marketplace) use temporary sites (`siteless.{jetpack|akismet|marketplace.wp|a4a}.com`). Guard with `hasQueryableSite( purchase )` (`utils/purchase.ts`), which wraps `purchase.is_attached_to_holding_site`. Never fire **any** site-scoped query for these — not just `siteBySlugQuery()`, but anything hitting `/sites/{blog_id}/…` (`siteFeaturesQuery`, `sitePurchasesQuery`, `siteByIdQuery`, `siteDomainsQuery`, `cancellationOffersQuery`, backup queries, …). Use `purchase.domain` or `purchase.blog_id` for display, and skip site-dependent UI entirely.

   The user is not a member of the holding site, so those requests return `403 authorization_required`. `AuthProvider` (`app/auth/index.tsx`) subscribes to the whole query cache; it now re-checks `/me` before acting on such an error, so a 403 on an inaccessible resource no longer signs the user out (it used to, causing a `/log-in` redirect loop — SHILL-2295). Don't rely on that safety net: each of these queries is still a failed request, a wasted round trip, and an error-state screen. Note also that `.catch()` on `ensureQueryData` does **not** suppress the cache error, since the *cache* entry still transitions to `error`. Prefer not firing the query at all (`enabled: false`).

   When gating a query with `enabled`, read `isLoading` rather than `isPending` in loading conditions. A disabled query stays `isPending` forever, so an `isPending`-based gate leaves the screen stuck on its loading placeholder.

8. **Transferred purchases** — Always check ownership before allowing purchase actions.

9. **Route params are strings** — `purchaseId` from URL params must be `parseInt()`'d before passing to query functions.

10. **`site.options.unmapped_url` lies for `.home.blog` sites** — Returns the `.wordpress.com` URL even when the site's free domain is `.home.blog` (or another `.blog` subdomain). Don't use it to render the user's free hostname. Read the actual WPCOM domain from `siteDomainsQuery( siteId )` — find the entry flagged `wpcom_domain` or `is_wpcom_staging_domain` and use its `domain` field. This is the same root issue as Classic's `site.wpcom_url`, which is just `withoutHttp( unmapped_url )` — see `client/me/purchases/AGENTS.md` pitfall #6.
