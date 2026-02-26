# Stats (Calypso)

Stats pages in the classic Calypso dashboard at `/stats/*`. This is the primary stats codebase that powers both WordPress.com and Odyssey Stats (via code sharing).

## Directory Structure

```
client/my-sites/stats/
├── components/           # Shared stats components
├── features/
│   └── modules/          # Stats modules (horizontal bar widgets) - TypeScript
├── hooks/                # React hooks for data fetching and utilities
├── pages/                # Full-page stats views
├── sections/             # Dashboard section components
├── stats-*/              # Legacy module components (stats-chart-tabs, stats-date-picker, etc.)
├── controller.jsx        # Route controllers
├── site.jsx              # Main site stats page (~800 lines)
├── overview.jsx          # Multi-site stats overview
├── index.js              # Route definitions
└── constants.ts          # Shared constants
```

## Tech Stack

- React + TypeScript (mixed, gradual migration from JSX)
- Redux for state management
- page.js routing (classic Calypso)
- Data components pattern (`QuerySiteStats`, etc.)

## Commands

```bash
yarn start                                           # Start Calypso dev server
yarn test-client client/my-sites/stats               # Run stats unit tests
yarn test-client --findRelatedTests <file>           # Run related tests
yarn test-client --testNamePattern="<TestName>"      # Run specific test
```

## State Management

### Redux Selectors

Stats data comes from `calypso/state/stats/*`:

- `getSiteStatsNormalizedData()` — normalized stats data
- `isRequestingSiteStatsForQuery()` — loading states
- `hasSiteStatsQueryFailed()` — error states

### Data Components

The codebase uses a data component pattern where `Query*` components trigger Redux actions:

```tsx
<QuerySiteStats siteId={ siteId } statType="statsVisits" query={ query } />
```

This fetches data into Redux; use selectors to read it.

### TanStack Query

Newer code uses Query hooks directly (e.g., in `hooks/` and Odyssey). Prefer this for new features.

## Conventions

### New Modules

Place new stats modules in `features/modules/` using TypeScript. Follow existing module patterns.

### Date/Timezone Handling

Always use site-aware moments via `useMomentSiteZone()` hook. Never use `moment()` directly—sites have configured timezones that must be respected.

### Analytics

Use the stats-specific analytics wrapper:

```tsx
import { trackStatsAnalyticsEvent } from './utils';
trackStatsAnalyticsEvent( 'stats_module_expanded', { module: 'referrers' } );
```

### Feature Gating

Use `useShouldGateStats()` hook to check if features should be gated behind a paywall.

### Module Visibility

Module visibility toggles use localStorage via the `store` library. See `stats-module-visibility-*` patterns.

### Hooks over HOCs

Prefer `useSelector()` hook over `connect()` HOC for new code.

## Common Pitfalls

### Mixed Patterns (Legacy + Modern)

The codebase has both legacy class components with `connect()` and modern functional components with hooks. New code should use hooks, but understand both patterns when modifying existing code.

### Large Files

Several files are quite large and complex:

- `site.jsx` (~800 lines) — main site stats page
- `controller.jsx` (~500 lines) — route controllers
- `stats-module/index.jsx` — base module component

Consider the full context when making changes to these files.

### Date Complexity

Stats dates are tricky:

- Always use `useMomentSiteZone()` for site-aware dates
- Period boundaries (week start, month end) depend on site settings
- `moment.js` is used throughout; not yet migrated to date-fns

### CSS Conventions

- Use CSS logical properties (`margin-inline-start`, not `margin-left`)
- Follow BEM-like class naming (`module-content-list-item-action`)
- See `README.md` for detailed list markup patterns

### Redux Data Flow

The `Query*` component pattern can be confusing:

1. `QuerySiteStats` mounts and dispatches fetch action
2. Redux middleware makes API call
3. Data lands in Redux store
4. Component re-renders via selector

Data may not be immediately available after mounting `Query*` component.

## Integration with Odyssey Stats

This code is shared with Odyssey Stats (`apps/odyssey-stats/`). When making changes:

- Test both Calypso and Odyssey contexts
- Be aware of API differences (WP.com vs Jetpack REST API)
- Check for Odyssey-specific overrides in webpack config

## Key Hooks Reference

| Hook                          | Purpose                             |
| ----------------------------- | ----------------------------------- |
| `useMomentSiteZone()`         | Site-timezone-aware moment instance |
| `useShouldGateStats()`        | Check if feature requires upgrade   |
| `useStatsPurchases()`         | Get user's stats-related purchases  |
| `useNoticeVisibilityQuery()`  | Check notice dismissal state        |
| `useStatsNavigationHistory()` | Track navigation for back button    |
