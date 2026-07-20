# Odyssey Stats admin colour scheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Odyssey Stats (Calypso Stats embedded in wp-admin) follow the user's WordPress admin colour scheme instead of forcing Jetpack green.

**Architecture:** Two independent mechanisms pin Odyssey to green: the `useWPAdminTheme` hook short-circuits every Jetpack site to an `is-jetpack` class, and a SCSS mixin force-maps `--color-primary-*` / `--color-accent-*` onto the Jetpack green scale (applied to both `:root` and `.color-scheme.is-jetpack`). Both are removed, leaving `.color-scheme.is-<scheme>` from `@automattic/calypso-color-schemes` as the single source of both colour scales. Tasks are ordered so every commit leaves the app rendering correctly.

**Tech Stack:** React + TypeScript, SCSS, `@automattic/calypso-color-schemes`, Jest + React Testing Library, webpack (`postcss-prefix-selector`).

**Spec:** `docs/superpowers/specs/2026-07-20-odyssey-stats-admin-theme-design.md`

## Global Constraints

- Work from `/Users/adamwood/Projects/Automattic/wp-calypso/.claude/worktrees/stats-322-self-hosted-stats-should-respect-admin-theme`. Every file path resolves under that root; never edit the main checkout.
- Do not add narrating code comments (`// Changed from X`, `// Added to fix Y`). Only comments a future reader genuinely needs. Match surrounding comment density.
- Preserve existing curly quotes/apostrophes (`“” ‘’`) exactly. When editing a string containing them, match on an inner substring that excludes the quote delimiters.
- No hardcoded colour values in SCSS. Use CSS custom properties.
- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- Do not silence type errors with `@ts-expect-error`, `@ts-ignore`, or `as any`.
- Never use `--no-verify` or `--no-gpg-sign`.
- Scheme class names are exactly `is-<scheme>` where `<scheme>` is the WP core slug: `fresh`, `light`, `modern`, `blue`, `midnight`, `sunrise`, `ectoplasm`, `ocean`, `coffee`.
- The renamed SCSS mixin is exactly `odyssey-stats-base-vars`.
- `--jetpack-white-off: #f9f9f6` must keep resolving at `apps/odyssey-stats/src/styles/wp-admin.scss:94` and `apps/odyssey-stats/src/widget/index.scss:63`.

---

### Task 1: Hook reads the admin colour scheme for all sites

**Files:**
- Modify: `client/my-sites/stats/hooks/use-wp-admin-theme.tsx` (whole file)
- Modify: `client/my-sites/stats/components/stats-main/index.tsx:15,110-113`
- Modify: `client/components/stats-interval-dropdown/index.jsx:12,119-122`
- Modify: `apps/odyssey-stats/src/components/root-child.tsx:10,17-20`
- Test: `client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx` (create)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `useWPAdminTheme(): string | null` — no parameters. Returns `null` when not running in wp-admin or when `document.body` carries no `admin-color-*` class; otherwise returns `` `is-${slug}` `` where `slug` is the text after `admin-color-`.

- [ ] **Step 1: Write the failing test**

Create `client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx`:

```tsx
/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import config from '@automattic/calypso-config';
import useWPAdminTheme from '../use-wp-admin-theme';

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: jest.fn() },
} ) );

const mockIsEnabled = config.isEnabled as jest.Mock;

describe( 'useWPAdminTheme', () => {
	beforeEach( () => {
		document.body.className = '';
		mockIsEnabled.mockReturnValue( true );
	} );

	it( 'returns null when not running in wp-admin', () => {
		mockIsEnabled.mockReturnValue( false );
		document.body.className = 'admin-color-midnight';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBeNull();
	} );

	it( 'maps the admin colour scheme body class to a Calypso scheme class', () => {
		document.body.className = 'wp-admin admin-color-midnight';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBe( 'is-midnight' );
	} );

	it( 'maps the default fresh scheme rather than forcing Jetpack colours', () => {
		document.body.className = 'wp-admin admin-color-fresh';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBe( 'is-fresh' );
	} );

	it( 'returns null when no admin colour class is present', () => {
		document.body.className = 'wp-admin';

		const { result } = renderHook( () => useWPAdminTheme() );

		expect( result.current ).toBeNull();
	} );
} );
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `yarn test-client client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx`

Expected: FAIL. The current hook signature takes an `isSiteJetpack` argument; calling `useWPAdminTheme()` passes `undefined`, which is falsy, so the `is-midnight` and `is-fresh` cases happen to pass — but this is the baseline to change. If all four pass already, re-read the hook: the `isSiteJetpack` branch must still be present at lines 14-16.

- [ ] **Step 3: Rewrite the hook**

Replace the whole body of `client/my-sites/stats/hooks/use-wp-admin-theme.tsx`:

```tsx
import config from '@automattic/calypso-config';
import { useMemo } from 'react';

// We cannot use any of the Calypso state selectors here, as this hook is used in the RootChild component, where there is no Redux context.
export default function useWPAdminTheme() {
	const isWPAdmin = config.isEnabled( 'is_odyssey' );

	const customTheme = useMemo( () => {
		// Calypso deals with admin colors already, so skip if not in WP Admin.
		if ( ! isWPAdmin ) {
			return null;
		}
		// Read the admin color from the body class, and convert it to a Calypso theme class.
		for ( const className of document.body.classList ) {
			if ( className.startsWith( 'admin-color-' ) ) {
				return `is-${ className.replace( 'admin-color-', '' ) }`;
			}
		}
		// Otherwise, no custom theme.
		return null;
	}, [ isWPAdmin ] );

	return customTheme;
}
```

- [ ] **Step 4: Update `stats-main/index.tsx`**

At line 110-113, replace:

```tsx
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const customTheme = useWPAdminTheme( isSiteJetpack );
```

with:

```tsx
	const customTheme = useWPAdminTheme();
```

`isJetpackSite` is now unused in this file (it appears only at line 111). Change the import at line 15 from:

```tsx
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
```

to:

```tsx
import { getSiteSlug } from 'calypso/state/sites/selectors';
```

Leave the `useSelector` import at line 14 alone — it is still used at lines 39, 40, 109 and 116.

- [ ] **Step 5: Update `stats-interval-dropdown/index.jsx`**

At line 119-122, replace:

```jsx
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const customTheme = useWPAdminTheme( isSiteJetpack );
```

with:

```jsx
	const customTheme = useWPAdminTheme();
```

`isJetpackSite` is now unused (it appeared only at line 120). Delete the import line 12 entirely:

```jsx
import { isJetpackSite } from 'calypso/state/sites/selectors';
```

Leave the `useSelector` import at line 11 alone — still used at line 87.

- [ ] **Step 6: Update `root-child.tsx`**

At lines 17-20, replace:

```tsx
	const state = config( 'intial_state' );
	const siteId = config( 'blog_id' ) as number;
	const isSiteJetpack = isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } );
	const customTheme = useWPAdminTheme( isSiteJetpack );
```

with:

```tsx
	const customTheme = useWPAdminTheme();
```

Then delete the now-unused imports at lines 6 and 10:

```tsx
import config from '@automattic/calypso-config';
import { isJetpackSite } from 'calypso/state/sites/selectors';
```

Verify `config` is genuinely unused elsewhere in the file before deleting its import — grep the file for `config(` first. If it is still used, keep line 6.

- [ ] **Step 7: Run the tests**

Run: `yarn test-client client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx`

Expected: PASS, 4 tests.

- [ ] **Step 8: Run related tests and lint**

Run:
```bash
yarn test-client --findRelatedTests client/my-sites/stats/components/stats-main/index.tsx client/components/stats-interval-dropdown/index.jsx
yarn eslint client/my-sites/stats/hooks/use-wp-admin-theme.tsx client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx client/my-sites/stats/components/stats-main/index.tsx client/components/stats-interval-dropdown/index.jsx apps/odyssey-stats/src/components/root-child.tsx
```

Expected: tests PASS, eslint reports no errors. In particular there must be no `no-unused-vars` error for `isJetpackSite`, `config`, or `useSelector` — if there is, an import removal in steps 4-6 was missed or over-applied.

- [ ] **Step 9: Commit**

```bash
git add client/my-sites/stats/hooks/use-wp-admin-theme.tsx \
        client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx \
        client/my-sites/stats/components/stats-main/index.tsx \
        client/components/stats-interval-dropdown/index.jsx \
        apps/odyssey-stats/src/components/root-child.tsx
git commit -m "Stats: read the wp-admin colour scheme for Jetpack sites too

useWPAdminTheme pinned every Jetpack site — self-hosted and Atomic — to
the is-jetpack class, so Odyssey Stats ignored the user's admin colour
scheme. Read the admin-color-* body class for all wp-admin contexts; the
isSiteJetpack argument has no remaining purpose and is dropped."
```

---

### Task 2: Theme the wp-admin dashboard widget

Done before the mixin is stripped (Task 3) so the widget never loses its colours between commits.

**Files:**
- Modify: `apps/odyssey-stats/src/widget/index.tsx:38`
- Modify: `apps/odyssey-stats/src/styles/widget-base.scss:6`

**Interfaces:**
- Consumes: `useWPAdminTheme(): string | null` from Task 1.
- Produces: `.stats-widget-content` carrying `color-scheme is-<scheme>`, so `.color-scheme.is-*` rules resolve inside the widget.

- [ ] **Step 1: Confirm `is_odyssey` is true in the widget context**

The hook gates on `config.isEnabled( 'is_odyssey' )` from `@automattic/calypso-config`, but the widget initialises the *local* `ConfigApi` from `window.jetpackStatsOdysseyWidgetConfigData` (`apps/odyssey-stats/src/lib/init-widget-config.ts`), not `window.configData`. These may be different objects, in which case the hook returns `null` in the widget and no theme class is applied.

Do not guess. Add a temporary probe to `apps/odyssey-stats/src/widget/index.tsx` inside `init()`:

```tsx
	// eslint-disable-next-line no-console
	console.log( '[stats-widget] is_odyssey', config.isEnabled( 'is_odyssey' ) );
```

Build with `yarn dev` in `apps/odyssey-stats`, load the wp-admin dashboard, and read the console.

Expected: `true`. If it logs `false` or `undefined`, the hook cannot be used as-is in the widget. Fix it — do not skip the widget. The preferred fix is to drop the `is_odyssey` guard from the hook entirely: outside wp-admin no `admin-color-*` body class exists, so the loop already returns `null` and the guard is redundant. If you take that route, update the Task 1 test that asserts the `isWPAdmin === false` case, and note the change in the commit body.

Remove the probe before committing.

- [ ] **Step 2: Add the colour-scheme class to the widget**

In `apps/odyssey-stats/src/widget/index.tsx`, add the imports alongside the existing ones:

```tsx
import clsx from 'clsx';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
```

Inside the `App` component (which already calls `useTranslate()`), add:

```tsx
			const customTheme = useWPAdminTheme();
```

Then change line 38 from:

```tsx
				<div id="stats-widget-content" className="stats-widget-content">
```

to:

```tsx
				<div
					id="stats-widget-content"
					className={ clsx( 'stats-widget-content', 'color-scheme', customTheme ) }
				>
```

- [ ] **Step 3: Import the full colour-scheme set**

`apps/odyssey-stats/src/styles/widget-base.scss:6` currently imports `calypso-color-schemes-root`, which pulls in only `shared/colors` and the default scheme — no `.color-scheme.is-*` rules, so the class added in Step 2 would match nothing. Change:

```scss
@import "@automattic/calypso-color-schemes/src/calypso-color-schemes-root";
```

to:

```scss
@import "@automattic/calypso-color-schemes/src/calypso-color-schemes";
```

- [ ] **Step 4: Build and verify the scheme rules are present and scoped**

Run:
```bash
cd apps/odyssey-stats && yarn build
grep -c "color-scheme.is-midnight" dist/*.css
```

Expected: at least one match. If zero, the import in Step 3 did not take effect.

Then confirm the widget rules survived the `postcss-prefix-selector` step (see `apps/odyssey-stats/AGENTS.md` > CSS Scoping — `.color-scheme` is in the prefix target list, so these should be preserved):

```bash
grep -o "[^{}]*color-scheme\.is-midnight[^{}]*{" dist/*.css | head -5
```

Expected: selectors containing `.color-scheme.is-midnight`, not selectors where it has been rewritten into something unreachable.

- [ ] **Step 5: Check the bundle size gate**

Run: `cd apps/odyssey-stats && yarn test:size`

Expected: PASS. `.size-limit.js` gates `dist/build.min.js` (545 KiB) and `dist/widget-loader.min.js` (8 KiB) — both JavaScript, so the added CSS should not affect them. The `clsx` and hook imports do add JS to the widget chunk; if `widget-loader.min.js` exceeds 8 KiB, do not raise the limit. Instead, check whether the hook landed in the loader chunk rather than the lazily-imported `./widget` chunk, and keep it in the latter.

- [ ] **Step 6: Lint**

Run: `yarn eslint apps/odyssey-stats/src/widget/index.tsx && yarn stylelint apps/odyssey-stats/src/styles/widget-base.scss`

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/odyssey-stats/src/widget/index.tsx apps/odyssey-stats/src/styles/widget-base.scss
git commit -m "Stats: follow the admin colour scheme in the dashboard widget

The widget took its colours solely from the Jetpack green mixin and
shipped only the default colour scheme, so it had no way to react to the
admin theme. Apply the scheme class to .stats-widget-content and import
the full scheme set so those rules exist."
```

---

### Task 3: Remove the Jetpack green override

**Files:**
- Modify: `apps/odyssey-stats/src/styles/variables.scss:16-53`
- Modify: `apps/odyssey-stats/src/styles/theme.scss:3-6`
- Modify: `apps/odyssey-stats/src/styles/scoped-theme-for-widget.scss:4`

**Interfaces:**
- Consumes: the scheme class applied in Tasks 1 and 2.
- Produces: `@mixin odyssey-stats-base-vars` — sets `--jetpack-white-off: #f9f9f6` only. Replaces `@mixin jetpack-theme-for-odyssey-stats`, which no longer exists.

- [ ] **Step 1: Audit for consumers that lose their value**

Removing the `:root` include means any element inside `.jp-stats-dashboard` that reads an accent or primary variable but sits *outside* a `.color-scheme` element will lose it. Enumerate them first:

```bash
grep -rn -- "--color-accent\|--color-primary\|--theme-highlight-color\|--wp-admin-theme-color" apps/odyssey-stats/src/styles/
```

For each hit, confirm it is inside `.stats-main.color-scheme`, `.popover.color-scheme`, `.stats-widget-content` (now carrying the class from Task 2), or a `root-child` portal (`apps/odyssey-stats/src/components/root-child.tsx` sets `color-scheme` on portal roots).

Record the findings as a short list in the commit body. If a consumer is covered by none of those, it needs the scheme class added to its own container — fix it in this task rather than leaving it unset.

- [ ] **Step 2: Strip and rename the mixin**

In `apps/odyssey-stats/src/styles/variables.scss`, replace lines 16-53 (the whole `jetpack-theme-for-odyssey-stats` mixin) with:

```scss
@mixin odyssey-stats-base-vars {
	--jetpack-white-off: #f9f9f6;
}
```

This drops the `--color-primary-*` scale (14 declarations, lines 19-32), the `--color-accent-*` scale (14 declarations, lines 36-49), `--theme-highlight-color`, `--color-primary`, `--color-accent`, `--wp-admin-theme-color`, and `--geo-chart-color-light` / `--geo-chart-color-dark` — 34 declarations in total, leaving only `--jetpack-white-off`.

The two `--geo-chart-color-*` variables are already dead — nothing in `apps/`, `client/` or `packages/` reads them. The geochart reads `--color-accent-5` and `--color-accent` directly via `getComputedStyle` on `main.stats-main` (`client/my-sites/stats/geochart/index.jsx:384-387`), which the scheme class supplies.

Leave lines 1-14 (`$display-type-*` variables and `@mixin stats-section-header-for-jetpack`) untouched.

- [ ] **Step 3: Verify nothing still references the old mixin name**

Run: `grep -rn "jetpack-theme-for-odyssey-stats" apps client packages`

Expected: two hits only — `theme.scss:5` and `scoped-theme-for-widget.scss:4`, both fixed in the next steps. Any other hit must be updated too.

- [ ] **Step 4: Rewrite `theme.scss`**

Replace the whole of `apps/odyssey-stats/src/styles/theme.scss` with:

```scss
@import "variables";

.jp-stats-dashboard {
	@include odyssey-stats-base-vars;
}

// Stats Dashboard
.stats-main.color-scheme,
// Stats popups including date range picker and tooltips etc.
.popover.color-scheme {
	--wp-components-color-accent: var(--color-accent);
}
```

This removes the `:root` include — which was emitted unscoped (`app.scss` is in the postcss `ignoreFiles` list at `webpack.config.js:118`, and `:root` is in the prefix plugin's `exclude` list at `:132`), setting Jetpack green including `--wp-admin-theme-color` on the whole wp-admin page — and the `.color-scheme.is-jetpack` block, which is now dead: Task 1 removed its only producer, and this file held its only definition.

`--jetpack-white-off` moves to `.jp-stats-dashboard` so `wp-admin.scss:94` keeps resolving.

- [ ] **Step 5: Update `scoped-theme-for-widget.scss`**

Change the include at line 4 from `jetpack-theme-for-odyssey-stats` to `odyssey-stats-base-vars`. The file should read:

```scss
@import "variables";

.stats-widget-content {
	@include odyssey-stats-base-vars;
}
```

- [ ] **Step 6: Build and verify the green is gone**

Run:
```bash
cd apps/odyssey-stats && yarn build
grep -c "studio-jetpack-green" dist/*.css
```

Expected: zero matches from the stripped mixin. Note that `studio-jetpack-green` custom properties are also *defined* by `@automattic/calypso-color-schemes` itself, so a non-zero count is not automatically a failure — inspect any hits and confirm none come from a `--color-primary-*` or `--color-accent-*` assignment in Odyssey's own theme files.

Then confirm `--jetpack-white-off` still resolves:

```bash
grep -c "jetpack-white-off" dist/*.css
```

Expected: at least two — the definition plus its consumers.

- [ ] **Step 7: Lint and type-check**

Run:
```bash
yarn stylelint apps/odyssey-stats/src/styles/variables.scss apps/odyssey-stats/src/styles/theme.scss apps/odyssey-stats/src/styles/scoped-theme-for-widget.scss
yarn typecheck-client
```

Expected: no errors. `typecheck-client` is slow; run it once here rather than per-step.

- [ ] **Step 8: Commit**

```bash
git add apps/odyssey-stats/src/styles/variables.scss \
        apps/odyssey-stats/src/styles/theme.scss \
        apps/odyssey-stats/src/styles/scoped-theme-for-widget.scss
git commit -m "Stats: drop the Jetpack green override from Odyssey

The mixin force-mapped both colour scales onto Jetpack green and was
applied to :root, which set --wp-admin-theme-color across the entire
wp-admin page rather than just Stats. Removing it leaves the admin
scheme's own .color-scheme.is-* rules as the single source of both
scales. --jetpack-white-off is a static surface colour with live
consumers, so it survives on a Stats-scoped selector; the is-jetpack
block is dead now that nothing produces that class."
```

---

### Task 4: Verify in a browser

Static checks cannot confirm a colour change. This task produces the evidence for the PR.

**Files:**
- No source changes expected. If verification finds a defect, fix it here and amend the relevant task's commit or add a follow-up commit.

**Interfaces:**
- Consumes: the built app from Tasks 1-3.
- Produces: before/after screenshots for the PR body.

- [ ] **Step 1: Get a self-hosted site running Odyssey Stats**

Use the `context-a8c:jurassic-ninja-create` skill to create a site with Jetpack, then `context-a8c:jurassic-ninja-connect` to connect it. Build Odyssey against it per `apps/odyssey-stats/AGENTS.md`.

- [ ] **Step 2: Verify each scheme**

For each of `fresh`, `midnight` and `ectoplasm` — set via **Users → Profile → Admin Color Scheme** in wp-admin — confirm:

- Stats dashboard: link colours, focus rings, hover backgrounds, selected-state borders follow the scheme (these are the elements PR #112589 routed through `--color-accent`)
- A popover surface: the date-range picker or interval dropdown
- The geochart gradient uses the scheme's accent, not magenta `#d52c82` (that hardcoded value is the fallback when `--color-accent` is unset — seeing it means a variable did not resolve)
- The dashboard widget, including the mini-chart bars
- No element renders with an unset/transparent colour

- [ ] **Step 3: Verify the page-wide leak is fixed**

On the wp-admin dashboard, with a non-default scheme active, inspect `document.documentElement` in devtools and confirm `--wp-admin-theme-color` is the scheme's colour, not Jetpack green. Confirm wp-admin chrome outside Stats (admin menu, buttons on other admin pages) is unaffected by Stats' stylesheet.

- [ ] **Step 4: Capture screenshots**

Capture before/after for at least two schemes. Use the `pr-screenshots` skill at PR time to attach them.

- [ ] **Step 5: Commit any fixes**

If Steps 2-3 surfaced defects, fix them and commit with `adamwoodnz-ai:git-commit`. If nothing needed fixing, there is nothing to commit — record the verification results for the PR body instead.

- [ ] **Step 6: Note the Atomic behaviour change for the PR body**

The removed short-circuit covered Atomic sites as well as self-hosted (its comment read "All Jetpack sites should be in Jetpack colors, including Atomic sites"), so Atomic Stats also moves off Jetpack green. This is intended and was agreed during design, but it is wider than the issue title implies — state it explicitly in the PR description so reviewers are not surprised.

---

## Verification summary

Run before opening the PR:

```bash
yarn test-client client/my-sites/stats/hooks/use-wp-admin-theme.test.tsx
yarn typecheck-client
yarn lint:js
yarn lint:css
cd apps/odyssey-stats && yarn build && yarn test:size
```

Plus the browser pass in Task 4. Do not claim completion on static checks alone.
