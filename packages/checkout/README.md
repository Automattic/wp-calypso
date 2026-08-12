# Checkout

The host-agnostic WordPress.com checkout: the UI and logic that render identically inside any
checkout host — a Calypso modal, a Dashboard modal, or the legacy full-page `/checkout` route.

The package is being filled in incrementally; it starts as a skeleton plus the import boundary
described below.

## Import boundary

Nothing in this package may import from the legacy Calypso app (`calypso/*`, `client/*`) or from
Redux (`redux`, `react-redux`, `redux-thunk`). Host-specific behavior enters through a typed host
context supplied by the embedding app, and server data is read through `@automattic/api-queries`.

The boundary is enforced by `.eslintrc.js` — `no-restricted-imports`, `no-restricted-modules`, and
a `no-restricted-syntax` selector for `import()` — so a forbidden import fails `yarn lint:js` in
CI. `src/__tests__/import-boundary.ts` asserts the rules still bite.
