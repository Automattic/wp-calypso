# Flex usage data layer follow-up

When endpoints are available, implement:

1. api-core

- Add fetchers under `packages/api-core/src/hosting-flex-usage/`:
  - `fetchFlexUsage(siteId): Promise<{ storage_bytes_used; storage_bytes_cap; bandwidth_bytes_used; bandwidth_bytes_cap; compute_hours_used; compute_hours_cap; period_start; period_end; }>`

2. api-queries

- Add `siteFlexUsageQuery(siteId)` that wraps the fetcher with caching keys `['siteFlexUsage', siteId]`.

3. UI integration

- Replace `useFlexUsageMock(siteId)` in `overview-flex-usage-card` with the new query and loading states.
- Consider a secondary “details” link to a future Billing/Usage page.
