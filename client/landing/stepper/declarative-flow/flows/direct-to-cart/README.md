# Direct-to-Cart Flow

`/setup/direct-to-cart` — a partner-facing entry that drops users into checkout with a pre-selected paid plan, an auto-generated free subdomain, and a guaranteed atomic site, then redirects back to the referring integration after atomic transfer completes.

## URL parameters

- `plan` (required) — an atomic-triggering plan slug (Business/Commerce billing variants, or a free-hosting-trial slug). Anything else routes to the shared error step.
- `redirect_to` — https URL the user returns to after checkout + atomic transfer. Sanitized against the allowlist; `wpcom_purchase=1&wpcom_site=<slug>` is appended on the way back.
- `integration` — short opaque partner id (`^[a-z0-9-]{1,32}$`).
- `context_id` — per-context id (`^[a-z0-9-]{1,64}$`); the resumability key. Always pass a unique value per logical context.
- `title` — site title hint (≤80 chars); also biases the auto-generated subdomain.
- `coupon`, `ref` — passed through to checkout / recorded in Tracks.

## Files

- `direct-to-cart.ts` — flow orchestration (thin)
- `validate-params.ts` — URL param parsing and validation
- `sanitize-redirect.ts` — `redirect_to` allowlist check (https + exact hostname + dev-localhost rule)
- `build-checkout-url.ts` — chained-redirect URL construction (with contract-snapshot test)
- `resume-storage.ts` — per-tuple localStorage records with TTL
- `resolve-resumability.ts` — combines storage + API check to decide create / fast-path / resume

## Key invariants

1. The chained-redirect URL must always pass through `/setup/transferring-hosted-site` so atomic transfer is awaited before returning to the partner. The contract-snapshot test in `test/build-checkout-url.ts` is the regression gate — do not weaken it.
2. The `?plan` set is restricted to atomic-triggering plans only. Personal/Premium/Free are rejected at entry.
3. `redirect_to` sanitization is the only barrier to open-redirect abuse. The dev-only `http://localhost*` rule is the **only** env-conditional behavior in the sanitizer — every other env enforces https + exact hostname.
