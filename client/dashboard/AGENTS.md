# Multi-site Dashboard

This is the new hosting dashboard for WordPress.com.

## Sub-area Guides

- **me/billing-purchases/** — Billing & purchase management (cancel flows, payment methods, DataViews)
- **sites/** — `/sites/*` pages (single-notice invariant for on-load banners)

## Conventions

- Use TanStack Query and TanStack Router.
- Declare the search params a page keeps (filters, date ranges, page numbers) in the route's `validateSearch`, and change them with `router.navigate`. The router parses search values as JSON before `validateSearch` runs, so `?id=123` arrives as a number: validate a numeric param as a number there, not as a string. Read and remove one-shot params (flash ids, callbacks, notice flags) with `useConsumeSearchParams` from `app/hooks/use-consume-search-params`. Remove any other param in the one `router.navigate( { search, replace: true } )` its event makes: the app always registers a navigation blocker, which defers history writes, so a second navigation in the same task starts from the old search and puts the param back. Don't write the URL with `window.history`: a write without the entry's state drops the router's key and index, which `useCanGoBack` and scroll restoration read, and a router navigation in progress overwrites it. The exceptions are code that runs before the router is created and components that also render outside the dashboard router, like `sites/site-launch-modal/celebration-modal`. Some older code still writes `window.history` directly; don't copy it.
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

- Dark mode comes from the WPDS `ThemeProvider` (`app/theme-provider.tsx`), which generates every `--wpds-*` token for the user's color scheme. Style with `--wpds-*` tokens (or the `--dashboard-*` aliases of them) and the component works in both modes with no dark-specific CSS.
- Don't add `:root[data-theme='dark']` blocks, `when-dark-theme` blocks or hex colors. If a component you don't own hardcodes a light color, map it to tokens in `app/wp-components-overrides.scss` or `app/_dark-theme.scss` with a one-line comment naming the limitation and what removes it.
- Don't set `--wpds-*` properties; Stylelint rejects it. Pass a token to the component's color prop instead (for example `Progress.Indicator color`).
- `client/lib/color-scheme/dark-theme.scss` is the legacy dark theme for Reader and /themes, which don't have the provider yet. Don't extend it for the Dashboard.
