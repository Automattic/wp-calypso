Implemented BFCache/cap review fixes.

Files changed:

- [wait-heartbeat/index.ts](/Users/ebuccelli/Code/wp-calypso/client/lib/analytics/wait-heartbeat/index.ts)
- [wait-heartbeat/test/index.tsx](/Users/ebuccelli/Code/wp-calypso/client/lib/analytics/wait-heartbeat/test/index.tsx)

Key decisions:

- Persisted `pagehide` now marks wait hidden; `pageshow` restores visibility.
- Duplicate browser visibility signals ignored.
- Suspended waits capped when visibility returns.
- Added coverage for BFCache and cap behavior.

Plan deviation:

- `.ai/PLAN.md` empty. Followed task scope, PR metadata, review feedback, and repository patterns.

Validation:

- Focused tests: 21 passed.
- Affected suites: 7 suites, 61 tests passed.
- ESLint passed; existing `no-explicit-any` warning remains.
- Prettier and `git diff --check` passed.
- Client typecheck blocked by unrelated Dashboard omnibar errors.
- Full build/manual browser testing not run.