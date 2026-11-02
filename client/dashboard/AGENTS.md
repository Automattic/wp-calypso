# Multi-site Dashboard

This is the new hosting dashboard for WordPress.com.

## Sub-area Guides

- **me/billing-purchases/** — Billing & purchase management (cancel flows, payment methods, DataViews)
- **sites/** — `/sites/*` pages (single-notice invariant for on-load banners)

## Code Organization

### Where things live

- `app-dotcom/`, `app-a4a/` — entry points. See [docs/entry-points.md](./docs/entry-points.md).
- `app/` — things there's only one of: the app shell and what it mounts once, dashboard-wide services that hold global state or a client (e.g. `app/analytics`, `app/auth`, `app/locale`, `app/snackbars`), and route definitions (`app/router/<area>`).
- `sites/`, `me/`, `domains/`, `emails/`, `plugins/`, `agency/`, `agency-client/` — feature areas.
- `components/` — UI that screens render, shared across areas. It holds no global state. UI used only by the shell belongs in `app/`.
- `hooks/`, `utils/`, `types/` — non-UI code shared across areas.

### Placing new code

Many existing directories predate these rules. Follow them for new code, but don't move existing code as part of an unrelated change.

1. **Mirror the URL, minus params.** `/sites/$siteSlug/settings/php` belongs in `sites/settings/php/`, not `sites/settings-php/`. Hyphen-prefixed siblings (`settings-*`, `overview-*`, `security-*`) are legacy, so don't add more. `agency/` is the exception: it's grouped by product section (`/referrals` is in `agency/earn/referrals/`), so follow its neighbors.
2. **Give each screen its own directory:** `index.tsx` for the page, `summary.tsx` if a parent hub page lists it, and tests in `test/`. Code used only by that screen goes in its `components/`, `hooks/`, and `utils/`. Pieces in `components/` sit one level deep and are named for what they are: a card used only by the site overview goes in `sites/overview/components/backup-card/`, not in a `cards/` folder. A single-file piece can sit beside `index.tsx` instead. A component's folder can hold its own helpers: components, hooks, and utils that nothing else uses. They sit as single files beside its `index.tsx`, and the only folder allowed inside is `test/`. If something else needs a helper, or it outgrows one file, move it to the screen's `components/`, `hooks/`, or `utils/`.
3. **Keep routes and other directories apart.** Inside a feature area, a directory is either a route or one of `components/`, `hooks/`, `utils/`, `images/`, and `test/`, so a path tells you whether it's a URL: `sites/settings/php/` is a route, and `sites/settings/components/site-reset-modal/` isn't. Layout directories such as `sites/site/` count as routes, and `agency/` also has directories that group routes by product section.
4. **Use the smallest scope that contains every consumer.** Code for one screen stays in its directory. Code shared by two or more screens goes in `components/`, `hooks/`, or `utils/` under their nearest common parent, which is usually the area (`sites/components/`) and sometimes a section (`me/billing/components/`). Code shared across areas goes in the top-level `components/`, `hooks/`, or `utils/`. Don't add other kinds of folder, such as `lib/`, `helpers/`, or `mappers/`, and put a screen's DataViews in `components/dataviews/`.

### Directory layout

This is the target layout, and new code should follow it. Most existing code hasn't moved yet, so many of these paths don't exist today: for example, `sites/overview/components/backup-card/` is still `sites/overview-backup-card/`.

It shows where every non-route directory belongs at the top level, in `app/`, and directly under each area. Route directories appear only where they hold something. `test/` directories and code that nothing imports are left out. `agency/` is an exception for now: it doesn't follow this layout, so follow its neighbors there.

```text
client/dashboard/
├── app-dotcom/                               # entry point
├── app-a4a/                                  # entry point
├── app/
│   ├── 404/                                  # default not-found page
│   ├── 500/                                  # default error page
│   ├── account-recovery-interstitial/
│   ├── agents-manager/
│   ├── analytics/                            # dashboard-wide service
│   │   └── page-view-tracker/
│   ├── auth/                                 # dashboard-wide service
│   ├── command-palette/
│   ├── dev-tools/
│   ├── help-center/                          # dashboard-wide service
│   ├── hooks/                                # only what the shell or Classic uses
│   ├── locale/                               # dashboard-wide service
│   ├── logger/
│   ├── mutation-error-tracker/
│   ├── navigation-blocker/                   # dashboard-wide service
│   ├── notifications/
│   ├── omnibar/
│   │   └── stats-sparkline/
│   ├── responsive-sidebar/
│   │   └── sidebar-navigator/
│   ├── resurrected-welcome-modal/
│   ├── root/
│   │   └── loading-line/
│   ├── router/                               # route definitions, one file per area
│   ├── shopping-cart/
│   ├── snackbars/                            # dashboard-wide service
│   └── survicate/
├── components/                               # UI shared across areas
│   ├── action-list/  anchor-copy-button/  breadcrumbs/  button-stack/
│   ├── callout/  card/  clipboard-input-control/  collapsible-card/
│   ├── component-view-tracker/  confirm-modal/  dataviews/  date-range-picker/
│   ├── divider/  domain-contact-details-form/  domains-dataviews/  empty-state/
│   ├── environment/  error-boundary/  flash-message/  formatted-time/  grid/
│   ├── icon-list/  icons/  inline-support-link/  input-control/
│   ├── metadata-list/  notice/  offer-card/  overview-card/  page-header/
│   ├── page-layout/  pending-primary-domain-notice/  phone-number-input/
│   ├── plan-expiry-notice/  purchase-expiry-status/  router-link-button/
│   ├── router-link-menu-item/  router-link-summary-button/  section-header/
│   ├── sidebar/  site-bandwidth-stat/  site-change-address-modal/
│   ├── site-environment-badge/  site-expiry-notice/  site-fields/  site-icon/
│   ├── site-preview/  site-storage-stat/  snackbar-back-button/  stat/
│   ├── summary-button/  summary-button-card-footer/  summary-button-list/
│   ├── switcher/  text/  text-blur/  text-skeleton/  time-since/  truncate/
│   └── upsell-cta-button/
├── docs/
├── hooks/                                    # shared across areas
├── images/
├── types/
├── utils/                                    # shared across areas
│   └── transient-query-params.ts
├── agency/                                   # exception, see above
├── agency-client/
├── domains/
│   ├── components/                           # shared within domains/, and the /domains list
│   │   └── empty-domains-state/
│   ├── domain/                               # layout for /domains/$domainName/*
│   │   └── components/
│   │       ├── sidebar/
│   │       └── switcher/
│   ├── overview/                             # /domains/$domainName
│   │   └── components/
│   │       └── purchase-dialogs/
│   └── transfer/                             # /domains/$domainName/transfer
│       └── components/
│           └── segmented-bar/
├── emails/
│   ├── choose-email-solution/
│   │   └── components/
│   │       └── price-display/
│   ├── components/                           # shared within emails/
│   │   ├── dataviews/
│   │   ├── empty-domains-state/
│   │   └── empty-mailboxes-state/
│   ├── hooks/
│   └── utils/
├── me/
│   ├── account/                              # /me/account
│   │   └── components/
│   │       ├── deletion/
│   │       ├── gravatar/
│   │       └── personal-details/
│   ├── billing/                              # /me/billing
│   │   ├── components/                       # shared within me/billing/
│   │   │   ├── checkbox-with-support-link/
│   │   │   └── tax-location-form/
│   │   └── purchases/                        # /me/billing/purchases
│   │       └── components/
│   │           ├── akismet-logo/
│   │           └── paypal-logo/
│   ├── components/                           # shared within me/
│   │   ├── sidebar/
│   │   └── svg-icon/
│   └── preferences/                          # /me/preferences
│       ├── appearance/summary.tsx
│       ├── blocked-sites/summary.tsx
│       ├── language/summary.tsx
│       ├── mcp/summary.tsx
│       ├── privacy/summary.tsx
│       ├── reader/summary.tsx
│       └── wordpress-labs/summary.tsx
├── plugins/
│   ├── manage/
│   │   └── plugin/                           # /plugins/manage/$pluginId
│   └── utils/
└── sites/
    ├── index.tsx                             # /sites
    ├── components/                           # shared within sites/, and the /sites list
    │   ├── account-email-bouncing-notice/
    │   ├── add-new-site/
    │   ├── dataviews/
    │   ├── empty-sites-state/
    │   ├── guided-tour/
    │   ├── hosting-feature-activation-modal/
    │   ├── hosting-feature-gate/
    │   ├── hosting-feature-gated-with-callout/
    │   ├── hosting-feature-gated-with-overview-card/
    │   ├── hosting-feature-list/
    │   ├── jetpack-site-disconnect/
    │   ├── recovery-email-matches-account-email-notice/
    │   ├── security-key-reregister-notice/
    │   ├── silent-error-boundary/
    │   ├── site-delete-modal/
    │   ├── site-launch-button/
    │   ├── site-launch-modal/
    │   ├── site-leave-modal/
    │   ├── site-restore-modal/
    │   └── time-mismatch-notice/
    ├── hooks/
    ├── site/                                 # layout for /sites/$siteSlug/*
    │   └── components/
    │       ├── sidebar/
    │       ├── staging-site-sync-monitor/
    │       └── switcher/
    ├── logs/
    │   └── activity/                         # /sites/$siteSlug/logs/activity
    │       └── components/
    │           ├── actor/
    │           ├── event/
    │           └── formatted-block/
    ├── monitoring/                           # /sites/$siteSlug/monitoring
    │   └── components/
    │       ├── base-card/
    │       ├── http-responses-card/
    │       ├── performance-card/
    │       ├── request-methods-card/
    │       └── response-types-card/
    ├── overview/                             # /sites/$siteSlug
    │   └── components/
    │       ├── agency-site-share-card/
    │       ├── backup-card/
    │       ├── callout-skeleton/
    │       ├── difm-offer-card/
    │       ├── difm-offer-modal/
    │       ├── difm-upsell-card/
    │       ├── domain-transfer-upsell-card/
    │       ├── domain-upsell-card/
    │       ├── domains-card/
    │       ├── jetpack-connection-warning-card/
    │       ├── latest-activity-card/
    │       ├── migrate-site-card/
    │       ├── performance-card/
    │       ├── plan-card/
    │       ├── scan-card/
    │       ├── site-action-menu/
    │       ├── site-fields/
    │       ├── staging-site-sync-dropdown/
    │       ├── staging-site-sync-modal/
    │       ├── staging-site-sync-notice/
    │       ├── static-site-import/
    │       ├── storage/
    │       ├── subscribers-card/
    │       ├── two-step-required-notice/
    │       └── visibility-card/
    ├── scan/
    │   ├── active/                           # /sites/$siteSlug/scan/active
    │   ├── components/
    │   │   └── marked-lines/
    │   └── history/                          # /sites/$siteSlug/scan/history
    └── settings/                             # /sites/$siteSlug/settings
        ├── index.tsx                         # hub page, lists each child's summary.tsx
        ├── components/
        │   ├── plan/                         # a hub row with no page of its own
        │   ├── site-reset-modal/
        │   └── staging-site-delete-modal/
        ├── php/                              # /sites/$siteSlug/settings/php
        │   ├── index.tsx                     # the page
        │   └── summary.tsx                   # its row on the hub page
        ├── repositories/                     # /sites/$siteSlug/settings/repositories
        │   └── components/
        │       └── code-highlighter/
        └── site-visibility/                  # /sites/$siteSlug/settings/site-visibility
            └── components/
                ├── preview-links/
                └── site-preview-link/
```

### Import boundaries

ESLint doesn't enforce the first two rules yet, so existing code breaks them in places. Don't add new violations.

- Areas don't import from other areas. The one exception is `agency/` importing `sites/`, because A4A reuses site screens. If two areas need the same code, move it to the top-level `components/`, `hooks/`, or `utils/`.
  - We'll refactor A4A later to remove this exception.
- `components/`, `hooks/`, and `utils/` must not import feature areas or `app/router/`. They may use dashboard-wide services such as `app/analytics`, as long as the service doesn't import those either.
- Use relative imports inside `client/dashboard`. The lint rule that bans `calypso/*` also rejects `calypso/dashboard/...`.
- Don't reach Classic Calypso through a relative path. `../../../lib/foo` skips that lint rule without making the import acceptable. See [docs/package-imports.md](./docs/package-imports.md) for how exceptions work.

## Conventions

- Use TanStack Query and TanStack Router.
- Don't use Redux and `calypso/state`.
- **Never branch on `appConfig.name`** (e.g. `if (appConfig.name === 'dotcom')`). The dashboard has many variants; hardcoding behavior per variant doesn't scale. Some alternatives:
  1. If the behavior depends on the **site** (e.g. available features, capabilities), use `siteTypeSupportsFeature()` or extend `SiteTypeFeatureSupports` in `utils/site-type-feature-support.ts`.
  2. If the behavior genuinely differs per dashboard variant, add a property to `AppConfig` that each variant provides, and branch on that property instead of the name.
  3. Before doing either, ask: if this UX is better for one variant, wouldn't it be better for all users? Prefer a single code path when possible.

### Mutation snackbars

Use `withSnackbar()` from `app/snackbars/with-snackbar` to attach a snackbar to a mutation. Never write `meta: { snackbar }` by hand:

```ts
useMutation( withSnackbar( sitePhpVersionMutation( siteId ), { success: __( 'Saved.' ) } ) );
```

Every `@automattic/api-queries` mutation carries a `meta.statId` naming its failure stat. Spreading a factory and then setting `meta` replaces the whole object rather than merging, so the `statId` is lost. `withSnackbar()` merges instead. A `no-restricted-syntax` rule in `eslint.config.mjs` enforces this.

If the mutation needs other options too, wrap only the factory:

```ts
useMutation( {
	...withSnackbar( sitePhpVersionMutation( siteId ), { success: __( 'Saved.' ) } ),
	onSuccess: () => {
		/* … */
	},
} );
```

### Internationalization

- When calling locale-aware formatting functions (`toLocaleDateString`, `toLocaleString`, `Intl.*`, etc.), pass the user's locale from `useIntlLocale()` (`app/locale`) rather than `undefined`. Passing `undefined` falls back to the browser/OS locale, so output silently drifts from the user's WordPress.com language setting.
- Do **not** pass `useLocale()` to `Intl` constructors or locale-sensitive `Date` methods. It returns the WordPress.com locale slug, which prefers the locale variant, and some variants are not valid BCP 47 — they append the variant with an underscore (`sr_latin`, `de_formal`). `Intl` throws a `RangeError` on those and takes the page down. `useIntlLocale()` normalises it; in non-hook contexts use `getIntlLocale()` from `utils/locale`.
- `useLocale()` is still the right value everywhere the WordPress.com slug is expected: translations, `localizeUrl()`, and API `locale` parameters.

### Google Translate crash safety

When fixing a `react-google-translate` ESLint warning, leave a one-line comment noting the otherwise-pointless-looking change (an "unnecessary" `<span>`, a dropped `?.`) dodges a Google Translate DOM crash (react/react#11538) — else the next editor reverts it.

Translators wrap translated text in `<font>` elements, reparenting nodes React thinks it owns. React then calls `removeChild`/`insertBefore` on a parent that no longer holds the node and the whole page crashes. The lint rules don't catch every shape, so when writing or reviewing a component that renders differently while data loads:

- **Never swap one element for another across a loading boundary.** `isLoading ? <TextSkeleton length={ 6 } /> : <Text>{ value }</Text>` mounts a different element in each branch. Keep a single `<TextBlur isBlurred={ isLoading }>` mounted and change only its text.
- **This includes branches that return a bare string.** A `return 'Not found';` next to a `return <Foo />;` is the same element/text swap. Route every branch through the same mounted element and vary only the string inside it.
- **Prefer flipping a prop over adding or removing a node.** `{ ! isLoading && <div>{ description }</div> }` inserts and removes a sibling; where the design allows, mount it unconditionally and blur it instead.

### Testing

- Read [docs/testing.md](./docs/testing.md) before writing or modifying tests.

### Dark mode

- Shared dark-mode tokens and component-wide overrides for components used across multiple Calypso surfaces live in `client/lib/color-scheme/dark-theme.scss`. Add dashboard-only exceptions to `client/dashboard/app/_dark-theme.scss` using the existing `dashboard-dark-theme-*` mixins (or add a new one and `@include` it from `dashboard-dark-theme`) instead of writing ad-hoc `:root[data-theme='dark']` blocks elsewhere.
- When adding a component that is not already used in a dark-mode-supported surface, verify it in dark mode and add or reuse overrides where needed. If the component is already covered by the existing dark-mode baseline, assume the shared styling holds unless the new usage introduces new variants, states, wrappers, or local CSS.
- Prefer overriding the existing CSS custom properties (`--dashboard-*`, `--wp-components-*`, `--jp-*`) over hardcoding hex values in component styles.
- For styles authored inside a CSS Module (`*.module.scss`), `:root`-based overrides cannot reach the scope-hashed class. Use the shared `when-dark-theme` mixin from `calypso/assets/stylesheets/shared/mixins/dark-theme` (defined in `client/assets/stylesheets/shared/mixins/_dark-theme.scss`).
