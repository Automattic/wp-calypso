# Odyssey Stats

Calypso Stats embedded in wp-admin via Jetpack. Shares code heavily with `client/my-sites/stats/`.

## Directory Structure

```
src/
├── components/       # App-specific components (layout, headers, query wrappers)
├── hooks/            # TanStack Query hooks for stats data
├── lib/              # Config, API helpers, selectors
├── page-middleware/  # page.js + React integration
├── widget/           # Lightweight wp-admin dashboard widget
├── app.tsx           # Main entry point
├── widget-loader.ts  # Widget entry point
└── routes.ts         # Route definitions
```

## Commands

```bash
yarn build        # Production build
yarn dev          # Development build
yarn test:js      # Unit tests
yarn test:size    # Bundle size check
```

## Critical Constraints

### Config Initialization Order

`init-app-config` MUST be the first import in `app.tsx`:

```typescript
// The eslint-disable is intentional - do not reorder
import './lib/init-app-config';
```

### Bundle Size Limits

- `build.min.js`: 495 KiB max
- `widget-loader.min.js`: 8 KiB max

Run `yarn test:size` to verify.

### Hashbang Routing

Routes use `#!/path` format (not `/path`) because app runs inside wp-admin. All internal links must work with hashbang routing.

### API Differences

Odyssey routes API calls through Jetpack REST API, not `public-api.wordpress.com`. Use `getApi()` helper and test both Jetpack and WP.com Simple contexts.

## Conventions

- New data fetching: use TanStack Query hooks in `src/hooks/`
- Redux: only for site/user state inherited from Calypso
- Config access: use `config()` from `./lib/config-api`, not `@automattic/calypso-config`
- Gridicons: use `packages/components/src/gridicon/no-asset.tsx` (CDN-safe)

## Common Mistakes

- Importing `@automattic/calypso-config` directly (use local config wrapper)
- Adding imports before `init-app-config`
- Exceeding bundle size limits
- Using regular links instead of hashbang-compatible navigation
- Not testing in both Jetpack and WP.com Simple environments
