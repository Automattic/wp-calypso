# Flex plan usage card (v2 dashboard)

This card displays month-to-date site usage for storage, bandwidth, and compute for the WordPress.com Flex plan.

Location: `client/dashboard/sites/overview-flex-usage-card/`

Components:

- `index.tsx` — Card UI using v2 patterns (`Card`, `SectionHeader`, `ProgressBar`).
- `use-flex-usage-mock.ts` — Temporary mocked data hook that returns deterministic values per site.
- `style.scss` — Minimal styling for compact progress bars.

Integration:

- Imported and rendered in `client/dashboard/sites/overview/index.tsx`.
- Feature-flagged behind `dashboard/v2/flex-usage-card` and hidden for Jetpack-connected sites.

Future data source:

- Replace `useFlexUsageMock` with a query from `@automattic/api-queries` once endpoints exist.
- Suggested queries: `siteFlexUsageQuery(siteId)` for MTD usage and caps.
- Add fetchers to `packages/api-core` under `hosting-flex-usage/`.

Testing:

- Basic render test included in `test.tsx`. Use `yarn test-client client/dashboard/sites/overview-flex-usage-card/test.tsx`.

Accessibility:

- The progress bars include titles for screen readers (e.g., "Storage: 200 MB / 1 GB").
