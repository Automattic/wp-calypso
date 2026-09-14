# Checkout — WordPress.com Purchase Flow

Customer-facing checkout UI. Related billing areas:
`client/me/purchases/` (Classic), `client/dashboard/me/billing-purchases/` (Dashboard).

## Project Knowledge

### Directory Structure

```
client/my-sites/checkout/
├── src/
│   ├── components/
│   │   ├── checkout-main.tsx           # Top-level orchestrator
│   │   ├── item-variation-picker/     # Billing cycle selector (name misleads — not "variants")
│   │   └── wp-contact-form/           # Contact form (varies by product type — see Checkout Steps)
│   ├── payment-methods/               # One UI component per processor
│   ├── hooks/use-create-payment-methods/  # Generates PaymentMethod[] from cart + server config
│   └── lib/
│       ├── wpcom-store.ts               # @wordpress/data store (not Redux — checkout-specific state)
│       ├── leave-checkout.ts            # navigate() trap — see pitfall #6
│       └── *-processor.ts              # One per payment method (13 files)
├── get-thank-you-page-url/          # 800+ lines, exhaustive tests — see pitfall #5
└── checkout-thank-you/              # Post-purchase pages (8+ variants)
```

### Checkout Steps

Three hard-coded steps (not extensible without changes here):

1. **Review Order**
2. **Contact Details** — Form varies by cart contents:
   - No domains → billing address only
   - Domain registration → full ICANN contact details
   - Google Workspace → company name + billing address
   - Contact type determined by `getContactDetailsType(responseCart)` from `wpcom-checkout`
3. **Payment Method**

The sidebar/summary view is NOT a step — visibility is manually managed via
`isSummaryVisible` state to prevent it from blocking form submission.

### Checkout State

- **Redux** — global state (site, user, notices)
- **`@wordpress/data` store** (`wpcom-store.ts`) — checkout-specific: contact details, VAT,
  domain validation results, form touched fields
- **`useFormStatus()`** from `composite-checkout` — LOADING, READY, SUBMITTING
- **`useTransactionStatus()`** — NOT_STARTED, PENDING, COMPLETE, REDIRECTING, ERROR

### Payment Processing

Processors must handle four response paths: immediate success, redirect (PayPal/WeChat),
3DS challenge (Stripe), and polling (PIX). Not all paths apply to all processors.

### Package Boundaries

| Package              | Role                                                        | Key Rule                    |
| -------------------- | ----------------------------------------------------------- | --------------------------- |
| `composite-checkout` | Generic multi-step checkout framework                       | NO WP.com logic here        |
| `wpcom-checkout`     | WP.com-specific checkout (line items, tax, payment methods) | WP.com logic goes here      |
| `shopping-cart`      | Cart state via `useShoppingCart()`                          | Independent of checkout     |
| `calypso-stripe`     | Stripe.js wrapper                                           | Stripe-specific integration |
| `api-core`           | Fetchers, mutators, types for all API calls                 | Foundation layer            |
| `api-queries`        | TanStack Query wrappers around api-core                     | Dashboard consumes these    |

## Architectural Decisions

1. **Thank-you URL generated before transaction** — For redirect payment methods
   (PayPal, Bancontact), the thank-you URL is generated and passed to the processor
   BEFORE the transaction starts. Uses `:receiptId` placeholder, replaced by
   `/me/transactions` endpoint on return.

2. **Contact validation is two-step** — Form validation (required fields, format)
   then async domain registration validation (WPCOM backend). Both must pass.

### Adding a Payment Method

Seven touchpoints required (follow an existing implementation like PIX or BLIK):

1. **Payment method component** — `src/payment-methods/{name}.tsx`, export `create{Name}PaymentMethod()` returning a `PaymentMethod` object (`{ id, paymentProcessorId, label, activeContent, submitButton }`)
2. **Processor function** — `src/lib/{name}-processor.ts`, signature: `async (submitData, options, translate) => PaymentProcessorResponse`
3. **Register processor** — Add to processor map in `src/components/checkout-main.tsx`
4. **Create hook** — `src/hooks/use-create-payment-methods/use-create-{name}.ts`, optionally gate with `isEnabled('checkout/{name}')` for gradual rollout
5. **Register hook** — Call in `use-create-payment-methods/index.tsx`, add result to `paymentMethods` array
6. **Slug mapping** — Add bidirectional mapping in `packages/wpcom-checkout/src/translate-payment-method-names.ts` (e.g., `'pix'` ↔ `'WPCOM_Billing_Ebanx_Redirect_Brazil_Pix'`)
7. **Feature flag** — (Optional) Add to `config/{environment}.json` for gradual rollout; remove once fully enabled

Steps 6-7 are the ones agents miss — without slug mapping the method never appears.

### Retiring a Payment Method

The inverse of the above — used when the backend retires a processor (or a single
method on a still-active processor). Reference template: PR #110710 (SHILL-1968,
Razorpay). The backend instructions are in the wpcom retired-processors readme; this section covers
only the Calypso checkout side.

Two surfaces with opposite fates:

**Remove — the checkout offering** (undo the seven touchpoints above):

1. Payment method component (`src/payment-methods/{name}.tsx`) and its test.
2. Processor function (`src/lib/{name}-processor.ts`) and its registration in `checkout-main.tsx`.
3. Create hook (`use-create-{name}.ts`) and its registration(s) in `use-create-payment-methods/index.tsx`.
4. **Both directions** of the class↔slug mapping in `packages/wpcom-checkout/src/translate-payment-method-names.ts` AND the dashboard copy at `client/dashboard/me/billing-purchases/payment-methods/translate-payment-method-names.ts`.
5. Checkout-time UI: the `client/lib/checkout/validation.js` branch, `client/lib/cart-values` label, `payment-logo` name/style/svg, any `country-specific-payment-fields` reference.
6. Feature flag in `config/*.json` and any dedicated client package (Razorpay had `@automattic/calypso-razorpay`; most methods have none).

**Keep — historic display.** Saved and past payment methods must still render:

- The `payment_type` union member in `packages/api-core/src/upgrades/types.ts` (e.g. `'netbanking'`, `'razorpay'`) — historic purchase rows still carry it.
- For processors that stored partner-specific method meta (e.g. Razorpay's UPI: `razorpay_vpa`): the partner constant + identifier types in `api-core` and `packages/wpcom-checkout/src/stored-payment-method-util.tsx`, plus the stored-method logo. This is the JSON-contract surface documented in the backend readme. A processor that was never recurring and carried no partner-specific stored meta (e.g. dLocal/netbanking) has nothing here to keep beyond the `payment_type` union member.

**Why removing the class↔slug mapping is safe.** `translateWpcomPaymentMethodToCheckoutPaymentMethod` `throw`s on an unknown class, but it only ever runs over the cart's `allowed_payment_methods` (`src/lib/translate-cart.ts`) — i.e. methods currently on offer. Once the backend drops the retired class from `allowed_payment_methods`, the `default: throw` is unreachable. Historic purchase display reads the `payment_type` string, never the class translator — which is why the union member above must stay.

## Common Pitfalls

1. **Checkout links MUST include `redirect_to` and `cancel_to` params** — Missing
   these causes broken back/cancel navigation.

2. **Cart key matters** — Wrong cart key = wrong cart. `'no-site'` vs site ID vs
   `undefined` have different behaviors. See `packages/shopping-cart/README.md`.

3. **Checkout URL format** — Products use slugs, domain meta uses colon separator.
   Example: `/checkout/example.com/personal,domain_reg:example.com`. Don't construct
   URLs manually — use existing helpers.

4. **Payment method filtering** — Not all methods are available everywhere.
   `filterAppropriatePaymentMethods()` in `packages/wpcom-checkout/src/` handles
   country/currency/product filtering. Don't bypass this or hardcode availability.

5. **Thank-you page routing is 800+ lines with 20+ branches** — Routing logic is in
   `get-thank-you-page-url/index.ts` with exhaustive unit tests. The code explicitly
   warns: "IF YOU CHANGE THIS FUNCTION ALSO CHANGE THE TESTS." Don't add new
   thank-you routes without updating both.

6. **`navigate()` silently fails for `/setup/` routes** — `navigate()` uses
   `page.show()` which doesn't work for Stepper routes. Use `window.location.href`
   for cross-origin or setup redirects. See `src/lib/leave-checkout.ts`.

7. **3DS challenges not guaranteed** — Stripe 3D Secure may or may not trigger.
   Processors must handle both paths (direct success and challenge flow).

8. **Gift purchases bypass everything** — Check `cart.is_gift_purchase` first.
   Gift purchases skip all upsell logic and route to a separate thank-you page.

9. **Atomic sites use `.wpcomstaging.com`** — Thank-you URL logic replaces
   `.wordpress.com` with `.wpcomstaging.com` for Atomic sites.

10. **Siteless purchases** — Some products (Akismet, Jetpack, Marketplace) use temporary sites (`siteless.{jetpack|akismet|marketplace.wp|a4a}.com`). Guard with `purchase.isAttachedToHoldingSite`. Never query site data for these.

11. **Transferred purchases** — Always check ownership before allowing purchase actions.
