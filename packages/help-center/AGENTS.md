# Help Center

## Package Overview

`@automattic/help-center` is the shared component library for WordPress.com's in-app support experience. It runs in three environments:

1. **Calypso** — embedded directly as a React component in the WordPress.com dashboard.
2. **Simple sites** — loaded via `widgets.wp.com` as a Gutenberg editor plugin and wp-admin bar menu item.
3. **Atomic sites** — same as Simple when the site is connected to Jetpack. Falls back to a minimal link to wp.com/help when disconnected.
4. **CIAB (Calypso-in-a-Box)** — effectively an Atomic site for Help Center purposes. Also loaded via `widgets.wp.com`, not through Calypso.

Most code lives here in `packages/help-center/`. The `apps/help-center/` app handles building and deploying the webpack bundles that serve Simple sites, Atomic sites, and CIAB.

## Backend

The Help Center backend lives in `jetpack-mu-plugin` (outside this repo). It is responsible for:

1. **Loading the Help Center** in wp-admin, the block editor, CIAB, `/support`, and `/forums` — it enqueues the webpack bundles built by `apps/help-center/` from `widgets.wp.com`.
2. **Registering the `/help-center/*` REST API endpoints** used on Atomic sites when `canAccessWpcomApis()` returns `false`. These proxy requests to the WPcom REST API so the same frontend code works in both contexts.

Any change that requires new API endpoints, different API behavior, or loading the Help Center in a new context requires work in `jetpack-mu-plugin`, not in this repo.

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
- **Data fetching**: Use TanStack Query hooks in `src/data/`. Follow existing patterns. See the API Endpoints section below for full details.
- **Styling**: SCSS. Global styles in `src/styles.scss`.

## API Endpoints

### Dual-endpoint pattern

Data-fetching hooks use a dual-endpoint pattern controlled by `canAccessWpcomApis()`:

- **Calypso / Simple sites**: `canAccessWpcomApis()` returns `true` → calls go through `wpcomRequest` to the WPcom REST API.
- **Atomic sites**: `canAccessWpcomApis()` returns `false` → calls fall back to `apiFetch`, which hits WordPress REST API endpoints on the site itself (prefixed with `/help-center/`). These endpoints are registered by `jetpack-mu-plugin`.

### WPcom REST API endpoints (used in Calypso / Simple)

| Endpoint                                            | Method | Hook                            | Description                                    |
| --------------------------------------------------- | ------ | ------------------------------- | ---------------------------------------------- |
| `/wpcom/v2/help/ticket/new`                         | POST   | `use-submit-support-ticket`     | Submit a support ticket                        |
| `/wpcom/v2/support-activity`                        | GET    | `use-support-activity`          | Fetch active support tickets (New, Open, Hold) |
| `/wpcom/v2/help/support-status`                     | GET    | `use-support-status`            | Support eligibility, availability, tier        |
| `/rest/v1.2/me/sites/?include_domain_only=true`     | GET    | `use-user-sites`                | List user sites                                |
| `/rest/v1.1/sites/{siteId}?force=wpcom`             | GET    | `use-wpcom-site`                | Single site details                            |
| `/wpcom/v2/imports/analyze-url`                     | GET    | `use-is-wporg-site`             | Detect WP.org vs WP.com site                   |
| `/wpcom/v2/sites/{siteId}/jetpack-search/ai/search` | GET    | `use-jetpack-search-ai`         | AI-powered help article search                 |
| `/wpcom/v2/help/search`                             | GET    | `use-help-search-query`         | Search help articles                           |
| `/wpcom/v2/agency/help/zendesk/create-ticket`       | POST   | `use-submit-a4a-support-ticket` | A4A agency ticket                              |
| `/wpcom/v2/agency/help/pressable/support`           | POST   | `use-submit-a4a-support-ticket` | Pressable agency support                       |

### apiFetch fallback endpoints (used on Atomic sites)

When `canAccessWpcomApis()` is `false` (Atomic sites), these hooks fall back to `apiFetch` with the following paths:

| Fallback path                           | Corresponding WPcom endpoint                        |
| --------------------------------------- | --------------------------------------------------- |
| `/help-center/ticket/new`               | `/wpcom/v2/help/ticket/new`                         |
| `/help-center/support-activity`         | `/wpcom/v2/support-activity`                        |
| `/help-center/support-status`           | `/wpcom/v2/help/support-status`                     |
| `/help-center/jetpack-search/ai/search` | `/wpcom/v2/sites/{siteId}/jetpack-search/ai/search` |
| `/help-center/search`                   | `/wpcom/v2/help/search`                             |

### External service integrations

| Service        | Package                      | Purpose                                               |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| Zendesk Smooch | `@automattic/zendesk-client` | Live chat messaging (init, auth, conversations)       |
| Odie AI Chat   | `@automattic/odie-client`    | AI-powered chat support, conversations, unread counts |

## Common Pitfalls

- **Two deployment targets**: Changes must work in both Calypso (SPA) and Simple/Atomic/CIAB (via `widgets.wp.com`). Always test both. You only need to sandbox `widgets.wp.com` — the sites themselves don't need sandboxing.
- **Multiple entry points**: `apps/help-center/` has 8 webpack entry points for different contexts (Gutenberg, wp-admin, disconnected, etc.). A change may behave differently across entry points.
- **asset.json sync limitation**: If you add or remove `@wordpress/*` dependencies, the `.asset.json` files won't sync to the sandbox because Jetpack fetches them from production. You must deploy for dependency changes to take effect on Atomic.
- **Disconnected variants**: Some entry points have "disconnected" versions (e.g., `help-center-gutenberg-disconnected.js`) that show a minimal UI. Make sure changes don't break these variants.
- **API changes require backend work**: The API endpoints listed above are not defined in this repo. The frontend only sends search queries and renders whatever the API returns. If a change requires new endpoints or different API behavior, see the Backend section above.
