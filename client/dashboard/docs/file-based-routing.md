# File-based routing

The dashboard is moving from code-based routing (`createRoute` calls in `app/router/*`) to TanStack Router's file-based routing. This document records the decisions behind the migration and how to carry it out. Progress is tracked route by route in [file-based-routing-tracker.md](./file-based-routing-tracker.md).

If you are adding or changing a route while the migration is in progress, read [Conventions](#conventions) and follow the playbook for the current phase.

## Why

- **The route file says what the route needs.** A route's loader, guards, search schema and screen sit in one file, found by its URL. Anyone reading a screen can see which data is ready before it renders.
- **One strong convention.** "The URL tells you the file, the file tells you the data and the screen" leaves little to interpretation, for people and for agents.
- **Type-checked links.** Once the generated tree is registered, every `Link`, `navigate` and `redirect` target is checked against the real routes. Today nothing is.

## Status

| Phase | What                                                                                                       | State       |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----------- |
| 0     | Upgrade `@tanstack/react-router` from 1.114 to 1.170                                                       | In review   |
| A     | Move each route into its final file under `routes/`, still code-based. Merge the three apps into one tree. | Not started |
| B     | Switch to file-based routing in one PR                                                                     | Not started |
| C     | Bring each route up to the conventions                                                                     | Not started |

## Decisions

Each decision lists the options that were rejected, so they don't get reopened by accident.

### 1. Loaders `await` critical data; components read it with `useSuspenseQuery`

A route's `loader` calls `queryClient.ensureQueryData( query )` for the data the screen needs before it can render, and `queryClient.prefetchQuery( query )` for secondary data. Components read awaited data with `useSuspenseQuery( query )`: the data is already cached, so it never suspends, and it stays reactive to refetches and mutations. Prefetched-only data stays on `useQuery` and may show its own loading state.

Only components that belong to a migrated route are converted, plus shared components that read that route's awaited data.

Rejected:

- **`useLoaderData` everywhere.** It returns a snapshot taken at navigation time, so components don't update after mutations or background refetches without `router.invalidate()`.
- **Letting each route choose.** Two patterns is no convention.

### 2. One route tree for all three apps

Dotcom, CIAB and A4A share a single file-based tree. Each URL has exactly one route file.

Today each app builds its own tree from shared `create*Routes( config )` factories. That doesn't carry over: the generator produces one fixed tree, a route file can't belong to two generated trees, and two generated trees in one TypeScript program clash on the types they emit. A4A's `/sites/$siteSlug/**` routes collide with dotcom's, so the colliding routes merge into shared files.

Rejected:

- **Dotcom and CIAB file-based, A4A left code-based.** Registering the dotcom tree would break about 55 typed hooks on A4A route objects, and A4A would keep its own conventions.
- **One TypeScript project per app.** Splits `typecheck-client` and shared components, for no gain once the trees merge.

Every entry already ships every app's route configuration today, because `app/router/index.tsx` imports all the factories statically. A shared tree adds nothing to any bundle.

### 3. Per-app differences use `perApp`, keyed on `AppConfig.app`

`AppConfig` has an `app: 'dotcom' | 'ciab' | 'a4a'` field. Route files express per-app differences with the helpers in `app/router/per-app.tsx`:

```tsx
const SiteLayout = perAppComponent( {
	dotcom: lazyRouteComponent( () => import( '../../../sites/site' ) ),
	a4a: lazyRouteComponent( () => import( '../../../agency/sites/site' ) ),
} );

export const Route = createFileRoute( '/sites/$siteSlug' )( {
	loader: ( { context, params: { siteSlug } } ) =>
		perApp( context.config, {
			dotcom: async () => {
				/* … */
			},
			a4a: async () => {
				/* … */
			},
		} ),
	component: SiteLayout,
} );
```

CIAB falls back to the dotcom variant unless it has its own. Each component variant is its own lazy chunk, so an app never downloads another app's screens.

This is a deliberate exception to "never branch on `appConfig.name`" in [AGENTS.md](../AGENTS.md): `config.app` may only be read by the `perApp` helpers, and the helpers may only be used in `routes/**`. ESLint enforces both. Use `supports.*` for capability questions ("does this app have domains?") and `perApp` only to pick a variant.

Rejected:

- **Variants supplied through `AppConfig`** (extending `config.components`). Shared route files would stay app-neutral, but you couldn't tell from the route file what renders.

### 4. Routes that exist in only some apps are guarded in `beforeLoad`

Inclusion by construction ("only add this route when `config.supports.x`") becomes a runtime guard, because the tree is the same for every app:

```tsx
export const Route = createRoute( {
	beforeLoad: ( { context } ) => requireSupport( context.config, 'domains' ),
	// …
} );
```

`requireSupport( config, key )` and `requireFeature( flag )` from `app/router/per-app.tsx` throw `notFound()`. Put the guard on the highest layout route it applies to; a parent's `beforeLoad` runs before its children load. The sidebar already hides these items separately.

The existing `staticData` guards (`requiresSiteTypeSupport`, `requiresAgencyCapability`, `availableToInaccessibleJetpackSites`) stay as they are during the migration.

Rejected:

- **Declarative `staticData` keys checked centrally.** Matches the existing guards, but the check isn't visible in the route file.

### 5. `routes/` holds route configuration only

- Route files live in `client/dashboard/routes/`, mirroring the URL.
- A route file contains `loader`, `beforeLoad`, `head`, `validateSearch`, `staticData`, `errorComponent` and `component`. The screen itself stays in its feature folder (`sites/backups/…`) and the route file points at it.
- Nothing else goes in `routes/`: no helpers, no components, no `-`-prefixed files. Route helpers (`perApp`, `requireSupport`, `dashboardRedirect`, `getRouter`) and the generated `routeTree.gen.ts` live in `app/router/`.

Rejected:

- **Route files inside feature folders, mounted with virtual file routes.** The virtual config is a hand-maintained route map, which is what we're removing.
- **Screens inside `routes/`** in `-components/` folders. Strongest co-location, but moves hundreds of files and splits feature folders.

### 6. File naming follows TanStack's directory convention

| Route                                                                                               | File                                   |
| --------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Layout with children                                                                                | `sites/$siteSlug/backups/route.tsx`    |
| Index route (`path: '/'`)                                                                           | `sites/$siteSlug/backups/index.tsx`    |
| Leaf                                                                                                | `sites/$siteSlug/backups/download.tsx` |
| Leaf whose URL prefixes other routes that aren't its children (`/sites` next to `/sites/$siteSlug`) | `sites/index.tsx`                      |
| Pathless layout                                                                                     | `_agency/route.tsx`                    |
| Root                                                                                                | `__root.tsx`                           |
| Catch-all                                                                                           | `$.tsx`                                |

No dot-separated flat names. A folder without a `route.tsx` adds a URL segment but no layout.

### 7. A4A-only routes sit under the pathless `_agency` layout

`routes/_agency/route.tsx` guards every A4A-only route (`/overview`, `/marketplace`, …) with `requireSupport( context.config, 'agency' )` and the client-user redirect. URLs don't change.

The shared `/sites` routes can't sit under `_agency`, so the agency capability check (`isAllowedByCapabilities( matches )`, driven by `staticData.requiresAgencyCapability`) moves to the root `beforeLoad`, for A4A only. Code that finds routes by ID (the sidebar's `/agency/sites/$siteSlug` keys, `SITE_ROUTE_ID` in `components/site-expiry-notice/candidate.tsx`) switches to the new IDs.

### 8. Build: the TanStack plugin in Calypso's webpack config

- `@tanstack/router-plugin` runs in `client/webpack.config.js`, configured from `client/dashboard/tsr.config.json`, with `autoCodeSplitting: true`. Each route's `component` and `errorComponent` become their own chunk, replacing the hand-written `.lazy()` blocks.
- The plugin's loader matches every module and its options can't be serialized, which breaks thread-loader. The config scopes the plugin's rules to `client/dashboard/routes/` and sends that folder through babel-loader without thread-loader.
- `routeTree.gen.ts` is committed. It's part of the runtime, and `typecheck-client`, Jest and editors need it without running webpack. TanStack recommends committing it.
- `yarn generate-dashboard-routes` runs the generator CLI (`tsr generate` from `client/dashboard/`). The output is deterministic and takes about 0.3s.
- CI regenerates the tree and fails if `git diff` shows a change.
- The pre-commit hook regenerates the tree and stages it whenever a file under `routes/` is added, changed or deleted.
- `routeTree.gen.ts` is listed in `.eslintignore` (which also controls prettier) and marked `linguist-generated` in `.gitattributes`.

Rejected:

- **Gitignoring the file and generating it on install.** CI fails when `yarn install` leaves changes, and `tsc` and Jest would each need a pre-step.

### 9. Migrate in three phases

TanStack doesn't support mixing code-based and file-based routes in one tree, so a route-by-route switch isn't possible. Instead:

- **Phase A (incremental).** Move each route definition into its final file under `routes/`, still using `createRoute`, still assembled by `app/router/*`. Replace inclusion by construction with guards (decision 4), and merge A4A's colliding routes into the shared files with `perApp` (decision 3). Each PR is small and changes no behaviour. When Phase A ends, all three apps run the same code-based tree.
- **Phase B (one PR).** Mostly find-and-replace: `createRoute( { getParentRoute, path, … } )` becomes `createFileRoute( '<path>' )( { … } )`, the assembly in `app/router/*` is deleted, and the plugin, CLI script, CI check, pre-commit hook and type registration are turned on.
- **Phase C (incremental).** Bring each route up to the conventions (decisions 1 and 10).

Phases A and B change no behaviour at all. Every per-app difference is kept exactly, even ones that look accidental (A4A's site layout has no `head` or `errorComponent`; `performance/backend` is flagged for dotcom but always on for A4A). Each becomes a `perApp` branch and gets a [convergence](./file-based-routing-tracker.md#convergence) entry if it should change later. A behaviour change in A or B is a bug.

Phase A order:

1. `/plugins`. Small; settles the conventions.
2. `/sites`, merging dotcom, CIAB and A4A. The riskiest, so early.
3. `/emails`, `/start-store`, `/client`.
4. `/domains`.
5. `/me`.
6. A4A-only routes under `_agency`.
7. Root, `/` and `$`; delete the config branches in `createRouteTree`.

Large subtrees can span several PRs.

### 10. Typing

- **Phase A.** Each route file exports `Route`. Consumers import it from the route file, e.g. `import { Route as siteRoute } from '…/routes/sites/$siteSlug/route'`, so Phase B doesn't touch them.
- **Phase B.** Register the router type globally and fix literal `to` values that newly fail the type check. Registration can't happen earlier: it type-checks `createLazyRoute( '<id>' )` names against the registered tree.
- **After Phase B.** New code uses `getRouteApi( '<id>' )` in components and doesn't import route files. Phase C converts existing imports.

### 11. Calypso routers that reuse dashboard routes stay code-based

Four Calypso routers build on dashboard route definitions:

- `client/sites/v2/*` copies the options of 19 `sites.tsx` routes (`createRoute( { ...appRouterSites.xRoute.options, getParentRoute } )`).
- `client/my-sites/purchases/v2/router.tsx` reuses 13 `me.tsx` route objects directly, rewriting their paths, and blanks out `siteRoute`, `domainRoute`, `emailsRoute` and `addMailboxRoute`.

These stay code-based and take the new `Route` objects. With file routes, `path` and `id` come from `routeTree.gen.ts`, which the Calypso bundle doesn't import, so Phase B makes these routers set `path` themselves. Routes they reuse are marked in the tracker; those route files must not depend on anything only the generated tree sets. Moving the remaining Calypso surfaces onto the dashboard tree is a separate project, once the surfaces being deleted are gone.

### 12. Tests

Router tests in `app/router/test/*` keep their cases. In Phase B they build the router from `routeTree.gen.ts` with `createMemoryHistory` and each app's config as context, and test the runtime guards instead of tree construction. `test-utils.tsx` keeps its throwaway router.

Moving route tests from Jest to Playwright (real navigations, stubbed network) is a separate project.

## Conventions

### A route file in Phase A

```tsx
// routes/sites/$siteSlug/backups/route.tsx
import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line no-restricted-imports -- allowed in route files
import { perApp, perAppComponent } from '../../../../app/router/per-app';
import { Route as SiteRoute } from '../route';

const BackupsLayout = perAppComponent( {
	dotcom: lazyRouteComponent( () => import( '../../../../sites/backups' ) ),
	a4a: lazyRouteComponent( () => import( '../../../../agency/sites/site/backups' ) ),
} );

export const Route = createRoute( {
	getParentRoute: () => SiteRoute,
	path: 'backups',
	head: () => ( { meta: [ { title: __( 'Backups' ) } ] } ),
	loader: ( { context, params: { siteSlug } } ) =>
		perApp( context.config, {
			dotcom: async () => {
				/* … */
			},
			a4a: async () => {
				/* … */
			},
		} ),
	component: BackupsLayout,
} );
```

- Export `Route`; no other exports.
- Lazy-load screens with a module-level `const X = lazyRouteComponent( … )` (or `perAppComponent`), then `component: X`. Don't use `.lazy()` or `createLazyRoute` in new files.
- Route files never call `addChildren`. Until Phase B, `app/router/<subtree>.tsx` imports the route files and assembles the subtree.
- Option values are names or inline functions, never calls: write `const X = perAppComponent( … )` at module level, then `component: X`. The plugin's code splitter fails on call expressions (upstream bug), and Phase B is simpler if Phase A already follows this.

### A route file after Phase B

```tsx
// routes/sites/$siteSlug/backups/route.tsx
export const Route = createFileRoute( '/sites/$siteSlug/backups' )( {
	head: () => ( { meta: [ { title: __( 'Backups' ) } ] } ),
	loader: backupsLoader,
	component: BackupsLayout,
} );
```

Single-variant screens become static imports (`import BackupsScreen from '…'; component: BackupsScreen`); `autoCodeSplitting` splits them.

### Gotchas

- Deleting a route file doesn't regenerate the tree while the dev server runs. Run `yarn generate-dashboard-routes`; the pre-commit hook and CI also catch it.
- A route option whose value is a call expression breaks the production build (see the conventions above).

## Playbooks

### Phase A PR

1. Claim the next rows in the tracker: set their **A** column to `in progress (<branch>)`.
2. For each row, in tracker order (parents before children):
   1. Create the file from the **New file** column. Move the `createRoute` call there, exported as `Route`. `getParentRoute` imports the parent's `Route`.
   2. Replace `.lazy( … createLazyRoute … )` with a module-level `lazyRouteComponent` const.
   3. If the route was only created for some apps, add the `requireSupport` / `requireFeature` guard to the highest layout it applies to.
   4. If the row lists both a dotcom and an A4A definition, merge them with `perApp` / `perAppComponent`, keeping each app's behaviour exactly. Record differences worth converging in the tracker's Convergence table.
   5. Point every consumer at the new file (`import { Route as xRoute } from '…/routes/…'`) and delete the old definition.
   6. Update the subtree assembly in `app/router/<subtree>.tsx`.
3. If a row is marked **Calypso reuse**, check `client/sites/v2` or `client/my-sites/purchases/v2` still builds and its tests pass.
4. When a file in `app/router/` no longer defines routes, remove it from `legacyRouterFiles` in `client/dashboard/.eslintrc.js`.
5. Run `yarn typecheck-client` and the tests for the subtree and the router (`yarn test-client client/dashboard/app/router`).
6. Click through the subtree in each app it belongs to.
7. Set the rows to `done (#<PR>)` in the same PR.

### Phase B PR

1. Add `@tanstack/router-plugin` and `@tanstack/router-cli`, `tsr.config.json`, the webpack changes, `yarn generate-dashboard-routes`, the CI drift check, the pre-commit hook, `.eslintignore` and `.gitattributes`.
2. Convert every `createRoute` in `routes/` to `createFileRoute( '<path>' )`, dropping `getParentRoute` and `path`.
3. Turn single-variant `lazyRouteComponent` consts into static imports.
4. Delete the assembly in `app/router/*`; `getRouter` uses `routeTree.gen.ts`.
5. Register the router type and fix the type errors.
6. Make the Calypso routers set `path` on reused routes.
7. Rewrite `app/router/test/*` against the generated tree.
8. Update the `dashboard-create-screen` skill to create file routes.

### Phase C PR

1. Claim rows: set **C** to `in progress (<branch>)`.
2. For each route: anything the loader `await`s is read with `useSuspenseQuery` in the route's components; components use `getRouteApi` instead of importing route files.
3. Record any per-app convergence you notice in the Convergence table instead of fixing it in the same PR.
4. Run the type check and tests; set the rows to `done (#<PR>)`.

## Router version

The upgrade from 1.114 to 1.170 is a prerequisite: on 1.114 the plugin can't code-split route files outside the routes folder, and its production build calls `process.exit(0)`. Plugin versions are tied to the router version. The upgrade also changes:

- Error components and `onCatch` receive `unknown`; normalise with `toError()` from `utils/to-error`.
- `router.state.pendingMatches` and the `'redirected'` match status are gone. Use `getLeafRouteId()` from `app/performance-tracking` for the destination of a pending navigation.
- `redirect()` returns a `Response` with the options on `.options`.
- The first matches resolve after mounting, so tests that query the DOM right after rendering need the matches seeded (`test-utils.tsx` does this).
- `router.state.location.pathname` no longer includes the basepath.

## Follow-ups

- Move the remaining Calypso surfaces that reuse dashboard routes onto the dashboard tree.
- Route tests in Playwright.
- Converge the per-app differences recorded in the tracker.
- Report the code-splitter call-expression bug upstream.
