# Direct-to-Cart Flow

`/setup/direct-to-cart` — a partner-facing entry that drops users into checkout with a pre-selected paid plan, an auto-generated free subdomain, and a guaranteed atomic site, then redirects back to the referring integration after atomic transfer completes.

See `docs/integrations/direct-to-cart.md` for the partner-facing URL contract and `docs/proposals/2026-05-11-direct-to-cart-flow.md` for the design proposal.

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
