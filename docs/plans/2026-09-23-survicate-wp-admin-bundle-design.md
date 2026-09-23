# Survicate: one implementation for Calypso and wp-admin

**Date:** 2026-09-23
**Status:** Implemented; rollout pending (wp-calypso, wpcom, Jetpack PRs)
**Implementation plan:** `docs/plans/2026-09-23-survicate-wp-admin-bundle.md`

## Problem

Survicate is integrated twice.

- **wp-calypso** has `packages/survicate/` (`@automattic/survicate`): typed, unit-tested TypeScript that loads the SDK, sets visitor traits, and suppresses surveys while the Help Center or another modal is open, during support sessions, and pauses the SDK's targeting so a suppressed survey doesn't loop. Consumed by the Multi-site Dashboard (`client/dashboard/app/survicate/`) and classic Calypso (`client/lib/analytics/survicate.js`).
- **Jetpack** has `projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php`, which emits roughly 200 lines of ES5 inside a PHP heredoc for wp-admin on Simple and Atomic sites. It re-implements the same SDK lifecycle and suppression rules by hand, untested and unlinted.

The package on trunk is a strict superset of the heredoc (it adds the support-session gate and the suppression Tracks event). Every suppression tweak has to be made twice, and the wp-admin copy has already drifted behind.

## Decision

Build the wp-admin script from `packages/survicate/` and serve it from `widgets.wp.com`, the way `apps/help-center` and `apps/agents-manager` already serve Help Center and Agents Manager into wp-admin. PHP keeps only what only PHP can know: whether to load, and which site-level traits to attach.

### Alternatives considered

| Option | Release loop for a survicate change | Why not |
|---|---|---|
| Publish `@automattic/survicate` to npm; jetpack-mu-wpcom bundles it (the `@automattic/launchpad` precedent) | 2 repos, 3 PRs, npm publish, lockfile bump, twice-daily mu-wpcom train; Calypso and wp-admin run different versions for hours | Testing unpublished changes in wp-admin needs `pnpm link` + rebuild + sandbox sync. Bad loop for empirically tuned suppression rules. |
| Move the shared code into the Jetpack monorepo; Calypso consumes from npm | Same as above, reversed | The tested code and both existing consumers are in wp-calypso. |
| Share only constants and rules, keep two runtimes | Unchanged | The 200 untested lines stay. |
| **widgets.wp.com bundle (chosen)** | 1 PR in wp-calypso, 1 wpcom deploy; Simple and Atomic pick it up at once | Runtime dependency on `widgets.wp.com`, which the Help Center already has. No surveys is the correct degraded state. |

Folding the bundle into `apps/help-center` as an extra entry was rejected: it would tie Survicate releases to Help Center releases.

## Architecture

```
packages/survicate/           single implementation (unchanged behavior)
        │
        ├── client/dashboard/app/survicate/   MSD consumer (unchanged)
        ├── client/lib/analytics/survicate.js classic Calypso consumer (unchanged)
        │
        └── apps/survicate/                    NEW thin build layer
              survicate.js  ──webpack──▶  dist/survicate.min.js
                                          dist/survicate.asset.json
                                                │  TeamCity artifact → install-plugin.sh → deploy wpcom
                                                ▼
                                   https://widgets.wp.com/survicate/
                                                ▲
jetpack-mu-wpcom class-survicate.php ───────────┘
  should_load()            (unchanged)     enqueue by URL, deps + version from asset.json
  get_visitor_traits()     (unchanged)     window.wpcomSurvicateConfig = { locale, traits }
```

**Division of responsibility.** PHP decides *whether* (logged in, `is_admin`, not network/user admin, English, not P2) and *who* (email, site_id, site_type, editor_context, is_big_sky_site). The bundle decides *how*: viewport gate, SDK injection, trait push, and every suppression rule.

### `apps/survicate/`

Mirrors `apps/help-center` with everything React, i18n and CSS removed.

- `survicate.js` — reads `window.wpcomSurvicateConfig`, computes `isMobile` as `window.innerWidth <= 480` (the MSD's `useViewportMatch( 'mobile', '<' )` resolves to `(max-width: 480px)`), then `shouldLoadSurvicate` → `loadSurvicateScript( SURVICATE_WORKSPACE_ID )` → `setSurvicateVisitorTraits( traits )`. No `AbortSignal`: in wp-admin the page lifetime is the consumer lifetime.
- `webpack.config.js` — one entry. `DependencyExtractionWebpackPlugin` externalizes `@wordpress/data` to `wp.data` and writes `survicate.asset.json` with `dependencies` and a content-hash `version`. `injectPolyfill: false`.
- `package.json` — `teamcity:build-app` so the `CalypsoApps` TeamCity build picks it up; `dev` uses `calypso-apps-builder` with `--remotePath /home/wpcom/public_html/widgets.wp.com/survicate` for sandbox sync.
- `__tests__/` — jsdom test of the entry against a mocked `@automattic/survicate`.

### Pipeline

- `.teamcity/_self/projects/WPComPlugins.kt`: `apps/survicate/dist => survicate.zip` in `artifactRules`; `survicate-release-build` in the cleanup tag list.
- wpcom `bin/install-plugin.sh`: a `survicate_info` block (`files=widgets.wp.com/survicate`, `tc_tag=survicate-release-build`) plus the name-resolution case. This is the only wpcom-side change.

### `class-survicate.php`

`enqueue_scripts()` becomes: guard → read `survicate.asset.json` (transient-cached one hour; filesystem on Simple, `wp_remote_get` on Atomic, same pattern as help-center) → bail if unavailable → `wp_enqueue_script` the widgets URL with the asset's `dependencies` and `version` → `wp_add_inline_script( ..., 'before' )` setting `window.wpcomSurvicateConfig`. The heredoc, the `WORKSPACE_KEY` constant, the hardcoded `wp-data` dependency and the `__wpcomSurvicateInit` guard are removed.

## Release loop after this change

| Change | Where | Steps |
|---|---|---|
| Suppression rule, SDK handling, anything runtime | wp-calypso | PR → `install-plugin.sh survicate --release` → `deploy wpcom`. Live on Simple and Atomic. |
| New site-level trait or gating rule | jetpack | PR → mu-wpcom train. Bundle reads whatever `traits` PHP sends, so trait additions need no wp-calypso change. |

## Rollout order

1. wp-calypso PR merges. Nothing consumes the bundle yet.
2. wpcom PR merges; release and deploy the bundle. Verify `survicate.min.js` and `survicate.asset.json` in production.
3. Jetpack PR merges and ships. wp-admin switches from heredoc to bundle.

Each step is independently revertable, and wp-admin never points at a URL that does not exist yet.

## Failure modes

- Asset JSON unreachable: nothing enqueued, no error surfaced. The failure is cached for 5 minutes and the fetch times out after 2 seconds, so an unreachable widgets.wp.com never adds a blocking request to every admin page load.
- Bundle 404: console error only; wp-admin unaffected.
- Help Center store not registered: `isHelpCenterOpen()` already returns `false`.
- Two `wp_enqueue_script` calls on one page: `@automattic/load-script` deduplicates the SDK load.

## Testing

- `apps/survicate/__tests__/survicate.test.js`: config → package calls; no config → no-op; narrow viewport → `isMobile: true`; `shouldLoadSurvicate` false → no load; SDK load rejection swallowed.
- `Survicate_Test.php`: all existing `should_load`, `get_editor_context`, `get_visitor_traits` and singleton tests unchanged. The inline-JS assertions are replaced by: widgets URL enqueued, `deps`/`ver` from a stubbed asset transient, `before` script carries `locale` and traits, nothing enqueued when the asset JSON cannot be read.
- Manual: sandboxed Simple site with `yarn dev --sync`; an Atomic site after the wpcom deploy.

## Known gaps (follow-ups, not in scope)

- **Support sessions in wp-admin.** `isSupportSession()` reads `sessionStorage.boot_support_user` and `window.isSupportSession`, neither of which exists in wp-admin, so surveys can still reach a Happiness Engineer there. Same as today. Needs a PHP-side signal passed through the config.
- **Tracks attribution.** `calypso_survicate_survey_suppressed` will now fire from wp-admin with nothing distinguishing it from the MSD. A `host` property is a one-line addition when it becomes useful.
