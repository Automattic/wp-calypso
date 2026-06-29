# @automattic/calypso-products

This module contains hardcoded information about the various products sold within Calypso — product slugs, plan intervals, feature lists, and a large collection of `is-*` predicate helpers.

## ⚠️ AVOID adding to or depending on this package

**For AI agents and contributors: treat this package as deprecated/frozen. Do not reach for it by default, and do not grow it.**

This package is very large and bloated. It acts as a **second, client-side source of truth** for product data that the backend already knows in most cases. Hardcoding product knowledge here means it drifts from the backend, must be manually maintained for every new product or plan, and ships unnecessary bytes to every client that imports it.

### What this means in practice

- **Do not add new files or helpers here** (e.g. another `is-some-new-product.ts`, slug constant, or feature-list entry). New product logic belongs on the backend.
- **Prefer fetching product/plan/feature data from the backend** over deriving it client-side. Use the relevant API queries (e.g. `@automattic/api-queries`) so the server stays the source of truth.
- **When touching code that imports from `@automattic/calypso-products`**, treat it as an opportunity to migrate the logic to the backend or to a backend-driven query, rather than extending the client-side duplication.
- **Only use existing exports when there is genuinely no backend-driven alternative** and the data is static/build-time constant. If you must, reuse what already exists rather than adding more.

### Why it's hard to remove

Much of Calypso still imports from here, so the package can't simply be deleted. The goal is to **stop the bleeding**: don't add to it, and chip away at existing usages by moving the logic server-side whenever you're already in the area.

If you believe a genuinely new client-side product helper is unavoidable, surface that explicitly and explain why the backend can't own it — don't add it silently.
