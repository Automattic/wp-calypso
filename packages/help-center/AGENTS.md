# Help Center

## Package Overview

`@automattic/help-center` is the shared component library for WordPress.com's in-app support experience. It runs in three environments:

1. **Calypso** — embedded directly as a React component in the WordPress.com dashboard.
2. **Simple sites** — loaded via `widgets.wp.com` as a Gutenberg editor plugin and wp-admin bar menu item.
3. **Atomic sites** — same as Simple when the site is connected to Jetpack. Falls back to a minimal link to wp.com/help when disconnected.
4. **CIAB (Calypso-in-a-Box)** — effectively an Atomic site for Help Center purposes. Also loaded via `widgets.wp.com`, not through Calypso.

Most code lives here in `packages/help-center/`. The `apps/help-center/` app handles building and deploying the webpack bundles that serve Simple sites, Atomic sites, and CIAB.

## Architecture

### State Management

Help Center uses WordPress `@wordpress/data` stores and TanStack Query for server state. Data-fetching hooks live in `src/data/`.

### Key Directories

```
src/
├── index.ts              # Entry point & exports
├── components/           # React components (Help Center UI)
├── hooks/                # Custom React hooks
├── data/                 # Data-fetching hooks (TanStack Query, support tickets, site analysis)
├── contexts/             # React contexts
├── types/                # TypeScript type definitions
├── constants.ts          # Shared constants
├── stores.ts             # WordPress data store registrations
├── query-client.ts       # TanStack Query client setup
├── route-to-query-mapping.ts  # URL-to-search-query mapping for contextual articles
├── styles.scss           # Global styles
└── test/                 # Unit tests
```

### How Changes Flow to Simple/Atomic

Changes in `packages/help-center/src/` are consumed by `apps/help-center/` via its webpack entry points. The app bundles the package into 8 separate JS files (e.g., `help-center-gutenberg.min.js`, `help-center-wp-admin.min.js`) deployed to `widgets.wp.com/help-center/`. Jetpack enqueues these bundles on WordPress.com Simple and Atomic sites.

## Testing

### Unit Tests

```bash
# Run from repo root
yarn jest packages/help-center
```

Test files live in `src/test/` and alongside source files.

### Sandbox Testing (Simple/Atomic/CIAB)

To verify changes on Simple, Atomic, and CIAB sites you only need to sandbox `widgets.wp.com` — the sites themselves do not need sandboxing:

1. Sandbox `widgets.wp.com`.
2. Run `cd apps/help-center && yarn dev --sync` — this builds the webpack bundles and syncs them to your sandbox.
3. Visit any Simple, Atomic, or CIAB site and verify the Help Center works correctly.

See `apps/help-center/AGENTS.md` for more details on the build/sync layer.

## PR Guidelines

**Every PR touching `packages/help-center/`** must include testing instructions for both Calypso and Simple/Atomic/CIAB environments:

### Testing Instructions Template

```markdown
## Testing Instructions

### Calypso
1. Run `yarn start`.
2. Open the Help Center and verify [describe expected behavior].

### Simple/Atomic/CIAB
1. Sandbox `widgets.wp.com`.
2. Run `cd apps/help-center && yarn dev --sync`.
3. Visit any Simple, Atomic, or CIAB site (the site itself does not need sandboxing).
4. Open the Help Center and verify [describe expected behavior].
```

This "always include both" rule exists because nearly everything in `packages/help-center/src/` flows through to the Simple/Atomic/CIAB bundles. Missing sandbox testing steps is costly; including them when not strictly needed is cheap.

## Conventions

- **i18n**: Use `@wordpress/i18n` for all user-facing strings. New strings won't be translated on Atomic until the next `jetpack-mu-plugin` release (twice daily).
- **Components**: Prefer `@wordpress/components` over custom UI primitives.
- **Data fetching**: Use TanStack Query hooks in `src/data/`. Follow existing patterns.
- **Styling**: SCSS. Global styles in `src/styles.scss`.

## Common Pitfalls

- **Two deployment targets**: Changes must work in both Calypso (SPA) and Simple/Atomic/CIAB (via `widgets.wp.com`). Always test both. You only need to sandbox `widgets.wp.com` — the sites themselves don't need sandboxing.
- **Multiple entry points**: `apps/help-center/` has 8 webpack entry points for different contexts (Gutenberg, wp-admin, disconnected, etc.). A change may behave differently across entry points.
- **asset.json sync limitation**: If you add or remove `@wordpress/*` dependencies, the `.asset.json` files won't sync to the sandbox because Jetpack fetches them from production. You must deploy for dependency changes to take effect on Atomic.
- **Disconnected variants**: Some entry points have "disconnected" versions (e.g., `help-center-gutenberg-disconnected.js`) that show a minimal UI. Make sure changes don't break these variants.
