# Calypso Client

React + TypeScript application clients for WordPress.com. For repo-level context, see root `AGENTS.md`.

## Project Knowledge

Two coexisting architectures: Classic (`client/me/`, `client/my-sites/`) uses Redux +
page.js routing. Dashboard (`client/dashboard/`) uses TanStack Query + TanStack Router.

## Commands

```bash
yarn eslint <file>                    # Lint JS/TS/TSX
yarn eslint --fix <file>              # Lint + fix
yarn stylelint <file>                 # Lint CSS/SCSS
yarn prettier --write <file>          # Format
yarn typecheck-client                 # Type-check (slow)
yarn test-client <test-file>          # Run specific test
yarn test-client --findRelatedTests <file>  # Find + run related tests
```

## Conventions

- Use `import clsx from 'clsx'` — not `classnames`.
- One empty line between `import './style.scss'` and other imports.
- Avoid BEM shortcuts (`&--`, `&__`) in SCSS.
- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Prefer `@wordpress/components` over custom UI primitives (Button, Modal, Card, etc.). Avoid `__experimental*` components unless existing usage in codebase.
- No `any` unless justified — strict TypeScript throughout.
- kebab-case for directories (e.g., `components/auth-wizard`).
- `userEvent` over `fireEvent` in tests. `toBeVisible` over `toBeInTheDocument`.
- Dialog buttons on mobile: `.dialog__action-buttons` flips to
  `flex-direction: column-reverse` below `$break-mobile`. Flex labels inside
  buttons need `width: 100%` for `justify-content: center` to work.

## Billing & Payments

Skip this section if your task doesn't touch checkout, purchases, or billing.

Cross-cutting knowledge for checkout, purchases, and billing areas. Sub-area
AGENTS.md files: `client/my-sites/checkout/`, `client/dashboard/me/billing-purchases/`,
`client/me/purchases/`.

| Aspect           | Classic (`client/me/`, `client/my-sites/`) | Dashboard (`client/dashboard/`)     |
| ---------------- | ------------------------------------------ | ----------------------------------- |
| Purchase type    | `calypso/lib/purchases/types` (camelCase)  | `@automattic/api-core` (snake_case) |
| Expiry values    | `'autoRenewing'`, `'manualRenew'`          | `'auto-renewing'`, `'manual-renew'` |
| Query key prefix | N/A (Redux)                                | `'upgrades'` (NOT `'purchases'`)    |

### Package Boundaries

| Package              | Role                                                        | Key Rule                    |
| -------------------- | ----------------------------------------------------------- | --------------------------- |
| `composite-checkout` | Generic multi-step checkout framework                       | NO WP.com logic here        |
| `wpcom-checkout`     | WP.com-specific checkout (line items, tax, payment methods) | WP.com logic goes here      |
| `shopping-cart`      | Cart state via `useShoppingCart()`                          | Independent of checkout     |
| `calypso-stripe`     | Stripe.js wrapper                                           | Stripe-specific integration |
| `api-core`           | Fetchers, mutators, types for all API calls                 | Foundation layer            |
| `api-queries`        | TanStack Query wrappers around api-core                     | Dashboard consumes these    |

### API Layer

Queries live in `@automattic/api-queries` (`packages/api-queries/`), NOT in
`client/dashboard/data/` or `client/dashboard/app/queries/`. Adding a new query requires
a fetcher in `@automattic/api-core` (`packages/api-core/src/`) first, then a query
wrapper in `api-queries`. Query keys are domain-specific: purchases use `'upgrades'`
(historical), receipts use `'receipt'`, payment methods use `'me'`. Check existing
query key patterns in `api-queries` before adding new ones — wrong prefix silently
breaks cache invalidation.

### Common Pitfalls

1. **Two `Purchase` types** — Same name, incompatible fields (camelCase vs snake_case, different string values). Never copy logic between Classic and Dashboard without converting.

2. **Siteless purchases** — Some products (Akismet, Jetpack, Marketplace) use temporary sites (`siteless.{jetpack|akismet|marketplace.wp|a4a}.com`). Guard with `isTemporarySitePurchase()`. Never call `siteBySlugQuery()` for these — use `purchase.domain` or `purchase.blog_id` for display, skip site-dependent UI entirely.

3. **Transferred purchases** — Always check ownership before allowing purchase actions.

4. **Don't mix architectures** — Redux in Dashboard or TanStack in Classic = subtle bugs.

5. **Route params are strings** — `purchaseId` from URL params must be `parseInt()`'d before passing to query functions.
