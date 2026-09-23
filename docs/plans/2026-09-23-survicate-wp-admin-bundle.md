# Survicate wp-admin Bundle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Serve wp-admin (Simple and Atomic) the same Survicate implementation the Multi-site Dashboard uses, by bundling `packages/survicate/` into a `widgets.wp.com` script and reducing the Jetpack PHP to gating, traits and an enqueue.

**Architecture:** A new `apps/survicate/` build layer compiles a 20-line entry that calls `@automattic/survicate` with config PHP emits on `window.wpcomSurvicateConfig`. TeamCity builds it, `install-plugin.sh` ships it to `widgets.wp.com/survicate/`, and `class-survicate.php` in jetpack-mu-wpcom enqueues it by URL with dependencies and version read from `survicate.asset.json`. Design: `docs/plans/2026-09-23-survicate-wp-admin-bundle-design.md`.

**Tech Stack:** wp-calypso Yarn monorepo (webpack 5, `@automattic/calypso-build`, `@wordpress/dependency-extraction-webpack-plugin`, Jest + jsdom), TeamCity Kotlin DSL, wpcom `bin/install-plugin.sh` (bash), Jetpack monorepo (PHP 7.4+, PHPUnit via WorDBless, `jetpack` CLI).

**Three repositories are touched, in this order:**

| Part | Repo | Tasks |
|---|---|---|
| A | wp-calypso (this worktree) | 1–7 |
| B | wpcom (`~/WordPress/a8c-projects/wpcom-sandbox` is a sandbox checkout; the PR goes to the WPCOM repo) | 8 |
| C | Jetpack monorepo (`~/WordPress/a8c-projects/jetpack-atomic`) | 9–12 |

Part C must not ship before Part B is deployed and verified (Task 8, step 5).

**Before starting Part A:** this is an emdash worktree with no `node_modules`. Run `yarn` at the repo root once (it takes a few minutes). If husky or Node version complaints appear, see the `emdash-worktree-gotchas` memory.

---

## Part A — wp-calypso

### Task 1: Scaffold `apps/survicate`

**Files:**
- Create: `apps/survicate/package.json`
- Create: `apps/survicate/jest.config.js`
- Create: `apps/survicate/CLAUDE.md`

**Step 1: Create `apps/survicate/package.json`**

```json
{
	"name": "@automattic/survicate-app",
	"version": "1.0.0",
	"description": "Survicate loader for wp-admin, served from widgets.wp.com.",
	"homepage": "https://github.com/Automattic/wp-calypso",
	"license": "GPL-2.0-or-later",
	"author": "Automattic Inc.",
	"sideEffects": [
		"./survicate.js"
	],
	"repository": {
		"type": "git",
		"url": "git+https://github.com/Automattic/wp-calypso.git",
		"directory": "apps/survicate"
	},
	"bugs": "https://github.com/Automattic/wp-calypso/issues",
	"scripts": {
		"clean": "rm -rf dist",
		"teamcity:build-app": "yarn run build",
		"build": "NODE_ENV=production yarn dev && find dist -maxdepth 1 -type f ! -name '*.min.js' -name '*.js' -delete",
		"dev": "yarn run calypso-apps-builder --localPath dist --remotePath /home/wpcom/public_html/widgets.wp.com/survicate",
		"prepack": "yarn run clean && yarn run build"
	},
	"dependencies": {
		"@automattic/survicate": "workspace:^",
		"@wordpress/data": "^10.48.0"
	},
	"devDependencies": {
		"@automattic/calypso-apps-builder": "workspace:^",
		"@automattic/calypso-build": "workspace:^",
		"@wordpress/dependency-extraction-webpack-plugin": "^6.24.0",
		"@wordpress/readable-js-assets-webpack-plugin": "^3.24.0",
		"webpack": "^5.99.8"
	},
	"private": true
}
```

`@wordpress/data` is listed even though it is externalized at build time: the package declares it as a peer dependency and Yarn needs a workspace to satisfy it. Version ranges match `apps/help-center/package.json`; if `yarn` complains a range is unavailable, copy the current range from that file.

**Step 2: Create `apps/survicate/jest.config.js`**

```js
module.exports = {
	preset: '../../test/packages/jest-preset.js',
	testEnvironment: 'jsdom',
	testMatch: [ '<rootDir>/**/__tests__/*.[jt]s?(x)', '!**/.eslintrc.*' ],
	moduleFileExtensions: [ 'js', 'jsx', 'ts', 'tsx', 'json' ],
};
```

`test/apps/jest.config.js` discovers every `apps/*/jest.config.js`, so nothing else registers the tests.

**Step 3: Create `apps/survicate/CLAUDE.md`**

```
@README.md
```

(The README is written in Task 6.)

**Step 4: Register the workspace and lint the manifest**

Run: `yarn` (repo root)
Expected: completes; `yarn.lock` gains an `@automattic/survicate-app@workspace:apps/survicate` entry.

Run: `yarn eslint apps/survicate/package.json`
Expected: no output (clean).

**Step 5: Commit**

```bash
git add apps/survicate/package.json apps/survicate/jest.config.js apps/survicate/CLAUDE.md yarn.lock
git commit -m "Survicate: scaffold the wp-admin app package"
```

---

### Task 2: The entry point, test first

**Files:**
- Create: `apps/survicate/__tests__/survicate.test.js`
- Create: `apps/survicate/survicate.js`

**Step 1: Write the failing test**

`apps/survicate/__tests__/survicate.test.js`:

```js
/**
 * @jest-environment jsdom
 */

const mockShouldLoadSurvicate = jest.fn();
const mockLoadSurvicateScript = jest.fn();
const mockSetSurvicateVisitorTraits = jest.fn();

jest.mock( '@automattic/survicate', () => ( {
	SURVICATE_WORKSPACE_ID: 'workspace-id',
	shouldLoadSurvicate: mockShouldLoadSurvicate,
	loadSurvicateScript: mockLoadSurvicateScript,
	setSurvicateVisitorTraits: mockSetSurvicateVisitorTraits,
} ) );

const CONFIG = {
	locale: 'en_US',
	traits: {
		email: 'user@example.com',
		site_id: '123',
		site_type: 'simple',
		editor_context: 'wp-admin',
		is_big_sky_site: 'false',
	},
};

function setViewportWidth( width ) {
	Object.defineProperty( window, 'innerWidth', { value: width, configurable: true, writable: true } );
}

// The entry runs on import, so each test re-imports it in isolation.
function boot( config ) {
	if ( config === undefined ) {
		delete window.wpcomSurvicateConfig;
	} else {
		window.wpcomSurvicateConfig = config;
	}
	jest.isolateModules( () => {
		require( '../survicate' );
	} );
}

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'wp-admin Survicate entry', () => {
	beforeEach( () => {
		mockShouldLoadSurvicate.mockReset().mockReturnValue( true );
		mockLoadSurvicateScript.mockReset().mockResolvedValue( undefined );
		mockSetSurvicateVisitorTraits.mockReset();
		setViewportWidth( 1024 );
	} );

	afterEach( () => {
		delete window.wpcomSurvicateConfig;
	} );

	it( 'does nothing when PHP emitted no config', () => {
		boot( undefined );

		expect( mockShouldLoadSurvicate ).not.toHaveBeenCalled();
		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'gates on the locale PHP sent and a desktop viewport', () => {
		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: false } );
	} );

	it( 'treats viewports narrower than 480px as mobile', () => {
		setViewportWidth( 479 );

		boot( CONFIG );

		expect( mockShouldLoadSurvicate ).toHaveBeenCalledWith( { locale: 'en_US', isMobile: true } );
	} );

	it( 'does not load the SDK when the load gate says no', () => {
		mockShouldLoadSurvicate.mockReturnValue( false );

		boot( CONFIG );

		expect( mockLoadSurvicateScript ).not.toHaveBeenCalled();
	} );

	it( 'loads the SDK for the shared workspace and pushes the PHP traits', async () => {
		boot( CONFIG );
		await flushPromises();

		expect( mockLoadSurvicateScript ).toHaveBeenCalledWith( 'workspace-id' );
		expect( mockSetSurvicateVisitorTraits ).toHaveBeenCalledWith( CONFIG.traits );
	} );

	it( 'swallows an SDK load failure', async () => {
		mockLoadSurvicateScript.mockRejectedValue( new Error( 'blocked' ) );

		expect( () => boot( CONFIG ) ).not.toThrow();
		await flushPromises();

		expect( mockSetSurvicateVisitorTraits ).not.toHaveBeenCalled();
	} );
} );
```

**Step 2: Run the test to verify it fails**

Run: `yarn test-apps apps/survicate`
Expected: FAIL, `Cannot find module '../survicate'`.

**Step 3: Write the entry**

`apps/survicate/survicate.js`:

```js
import {
	loadSurvicateScript,
	setSurvicateVisitorTraits,
	shouldLoadSurvicate,
	SURVICATE_WORKSPACE_ID,
} from '@automattic/survicate';

// Matches the `mobile` breakpoint the Multi-site Dashboard gates on via
// `useViewportMatch( 'mobile', '<' )`, so both surfaces agree on "mobile".
const MOBILE_BREAKPOINT = 480;

function init() {
	// Emitted by class-survicate.php (jetpack-mu-wpcom) as a `before` inline
	// script; PHP has already decided the user, screen and site are eligible.
	const config = window.wpcomSurvicateConfig;
	if ( ! config ) {
		return;
	}

	const { locale = '', traits = {} } = config;

	if ( ! shouldLoadSurvicate( { locale, isMobile: window.innerWidth < MOBILE_BREAKPOINT } ) ) {
		return;
	}

	loadSurvicateScript( SURVICATE_WORKSPACE_ID )
		.then( () => {
			setSurvicateVisitorTraits( traits );
		} )
		.catch( () => {
			// Surveys are optional; a blocked or failed SDK load is not an error.
		} );
}

init();
```

**Step 4: Run the test to verify it passes**

Run: `yarn test-apps apps/survicate`
Expected: PASS, 6 tests.

**Step 5: Lint**

Run: `yarn eslint apps/survicate/survicate.js apps/survicate/__tests__/survicate.test.js`
Expected: clean.

**Step 6: Commit**

```bash
git add apps/survicate/survicate.js apps/survicate/__tests__/survicate.test.js
git commit -m "Survicate: add the wp-admin entry that boots the shared package"
```

---

### Task 3: Webpack config and a real build

**Files:**
- Create: `apps/survicate/webpack.config.js`
- Create: `apps/survicate/.gitignore`

**Step 1: Create `apps/survicate/webpack.config.js`**

Derived from `apps/help-center/webpack.config.js` with the React, i18n, chunks-map and smooch pieces removed.

```js
const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const ReadableJsAssetsWebpackPlugin = require( '@wordpress/readable-js-assets-webpack-plugin' );
const webpack = require( 'webpack' );

const isDevelopment = process.env.NODE_ENV !== 'production';

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @param   {Object}  env   environment options
 * @param   {Object}  argv  options map
 * @returns {Object}        webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	env.WP = true;

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: isDevelopment ? 'development' : 'production',
		entry: { survicate: path.join( __dirname, 'survicate.js' ) },
		output: {
			...webpackConfig.output,
			path: path.join( __dirname, 'dist' ),
			filename: '[name].min.js',
			chunkFilename: '[id].[contenthash:8].min.js',
			library: 'wpcomSurvicate',
		},
		plugins: [
			// The base config's extraction plugin writes a PHP asset file; we want
			// the JSON `survicate.asset.json` that class-survicate.php reads.
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new webpack.DefinePlugin( {
				'process.env.NODE_DEBUG': JSON.stringify( process.env.NODE_DEBUG || false ),
			} ),
			new DependencyExtractionWebpackPlugin( {
				// wp-admin registers wp-polyfill itself and the package is plain ES2017+.
				injectPolyfill: false,
				outputFilename: '[name].asset.json',
				outputFormat: 'json',
			} ),
			new ReadableJsAssetsWebpackPlugin(),
		],
	};
}

module.exports = getWebpackConfig;
```

**Step 2: Create `apps/survicate/.gitignore`**

```
dist
```

**Step 3: Build**

Run: `cd apps/survicate && yarn build`
Expected: exits 0; `dist/` contains `survicate.min.js` and `survicate.asset.json` (and nothing else after the `find … -delete`).

**Step 4: Verify the asset manifest**

Run: `cat apps/survicate/dist/survicate.asset.json`
Expected: JSON with `"dependencies"` containing `"wp-data"` and a non-empty `"version"` string. If `wp-polyfill` appears in `dependencies`, `injectPolyfill` did not take effect; fix that before continuing.

Run: `grep -c "survey.survicate.com/workspaces" apps/survicate/dist/survicate.min.js`
Expected: `1` (the package code is bundled, not externalized).

Run: `grep -o "e4794374cce15378101b63de24117572" apps/survicate/dist/survicate.min.js | head -1`
Expected: the workspace id, proving `SURVICATE_WORKSPACE_ID` is inlined and PHP no longer needs it.

**Step 5: Commit**

```bash
git add apps/survicate/webpack.config.js apps/survicate/.gitignore
git commit -m "Survicate: build the wp-admin bundle with an asset manifest"
```

---

### Task 4: TeamCity artifact and retention

**Files:**
- Modify: `.teamcity/_self/projects/WPComPlugins.kt:44` (cleanup tag list) and `:115` (artifact rules)

**Step 1: Add the release tag**

After the line `"agents-manager-release-build",` inside `withTags = anyOf(` add:

```kotlin
					"survicate-release-build",
```

**Step 2: Add the artifact rule**

After the line `apps/agents-manager/dist => agents-manager.zip` inside `artifactRules` add:

```
		apps/survicate/dist => survicate.zip
```

**Step 3: Sanity-check the edit**

Run: `grep -n "survicate" .teamcity/_self/projects/WPComPlugins.kt`
Expected: exactly two lines, one in each block, matching the indentation of their neighbours (tabs).

TeamCity validates the DSL on push; there is no local compile step. If the PR's "TeamCity DSL" check fails, the two lines are the only suspects.

**Step 4: Commit**

```bash
git add .teamcity/_self/projects/WPComPlugins.kt
git commit -m "Survicate: publish the wp-admin bundle as a TeamCity artifact"
```

---

### Task 5: Update `packages/survicate` docs for the new consumer

**Files:**
- Modify: `packages/survicate/AGENTS.md`
- Modify: `packages/survicate/README.md`

**Step 1: `AGENTS.md` — Support sessions section**

Replace the paragraph starting `**The wp-admin Survicate loader is a separate integration**` with:

```markdown
**wp-admin runs this same package** (built by `apps/survicate/`, enqueued by
`class-survicate.php` in the Jetpack monorepo), but `isSupportSession()` reads
browser state Calypso sets (`sessionStorage.boot_support_user`,
`window.isSupportSession`) that does not exist in wp-admin, so the gate is
inert there. A wp-admin support-session signal would have to come from PHP
through `window.wpcomSurvicateConfig`. Tracked as a follow-up.
```

**Step 2: `AGENTS.md` — Measuring suppression section**

Replace the sentence `The wp-admin loader (PHP) uses its own analytics path and does not emit this event yet.` with:

```markdown
The wp-admin bundle emits it too, with no property distinguishing the host yet.
```

**Step 3: `AGENTS.md` — remove the sync warning**

Delete the paragraph:

```markdown
The wp-admin loader (`jetpack-mu-wpcom/src/features/survicate/class-survicate.php`,
Jetpack monorepo) inlines the same logic in its emitted script; keep the two in sync
when changing selectors or behavior.
```

**Step 4: `AGENTS.md` — Consumers section**

Replace the section body with:

```markdown
Three consumers, all funnelled through `shouldLoadSurvicate()`:

- **Multi-site Dashboard** — `client/dashboard/app/survicate/index.tsx` (`useSurvicate`),
  gated behind the `survicate_enabled` config flag. Pushes identity and visit-count traits.
- **Classic Calypso** — `client/lib/analytics/survicate.js` (`addSurvicate`), and
  `invokeSurvicateEvent` from purchase/cancel and checkout flows.
- **wp-admin on Simple and Atomic** — `apps/survicate/survicate.js`, bundled to
  `https://widgets.wp.com/survicate/survicate.min.js` and enqueued by
  `class-survicate.php` in `jetpack-mu-wpcom`. PHP decides eligibility and emits
  site-level traits on `window.wpcomSurvicateConfig`; the bundle does the rest.
  Ship a change to wp-admin with `install-plugin.sh survicate --release` on a
  sandbox followed by `deploy wpcom` — no Jetpack release needed.
```

**Step 5: `README.md`**

Replace the second paragraph (`This package extracts the core Survicate logic…`) with:

```markdown
This package is the single Survicate implementation for WordPress.com surfaces: the Multi-site Dashboard and classic Calypso import it directly, and wp-admin on Simple and Atomic sites loads it as a `widgets.wp.com` bundle built by `apps/survicate/`. See `AGENTS.md` for the suppression model and the consumer map.
```

**Step 6: Commit**

```bash
git add packages/survicate/AGENTS.md packages/survicate/README.md
git commit -m "Survicate: document wp-admin as a consumer of the shared package"
```

---

### Task 6: App README and root AGENTS.md entry

**Files:**
- Create: `apps/survicate/README.md`
- Modify: root `AGENTS.md` (Apps section)

**Step 1: Create `apps/survicate/README.md`**

```markdown
# Survicate (wp-admin bundle)

Build and deploy layer that bundles [`packages/survicate`](../../packages/survicate) into a single script served from `https://widgets.wp.com/survicate/survicate.min.js`. wp-admin on Simple and Atomic sites enqueues it via `class-survicate.php` in the `jetpack-mu-wpcom` package of the Jetpack monorepo.

There is no logic here. `survicate.js` reads the config PHP emits on `window.wpcomSurvicateConfig` (`locale` and site-level `traits`), and hands off to the package. Anything about *how* surveys load or get suppressed belongs in `packages/survicate`.

## Development

### In Calypso

Nothing to do here: Calypso and the Multi-site Dashboard import the package directly. `yarn start` as usual.

### In Simple sites

1. Sandbox your site and `widgets.wp.com`.
2. `cd apps/survicate && yarn dev --sync` — builds on change and rsyncs `dist/` to `/home/wpcom/public_html/widgets.wp.com/survicate`.
3. Reload any wp-admin page. `localStorage.debug = 'survicate*'` in the console shows the package's debug log.

### In Atomic sites

Atomic fetches the same URL, so the Simple-site steps apply for JS changes. Because Jetpack reads `survicate.asset.json` over the network from *production*, a change to the bundle's dependency list only takes effect on Atomic after a deploy.

PHP changes (eligibility, traits) live in the Jetpack monorepo; follow the [`jetpack-mu-wpcom`](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/jetpack-mu-wpcom/README.md) development process.

## Testing

```bash
yarn test-apps apps/survicate
```

## Deployment

1. Merge to `trunk`. TeamCity's "Build Calypso Apps" produces `survicate.zip`.
2. On a sandbox: `install-plugin.sh survicate --release`, push the branch to the WPCOM repository when prompted, merge the resulting PR.
3. `deploy wpcom`.

Simple and Atomic pick the new bundle up on the next page load. No Jetpack release is involved unless `class-survicate.php` itself changed.
```

**Step 2: Root `AGENTS.md`, Apps section**

After the `**Help Center** (`apps/help-center`)` bullet add:

```markdown
- **Survicate** (`apps/survicate`) — build/deploy layer that bundles `packages/survicate` into the single script wp-admin loads from `widgets.wp.com`. No logic of its own.
```

**Step 3: Commit**

```bash
git add apps/survicate/README.md AGENTS.md
git commit -m "Survicate: document the wp-admin app"
```

---

### Task 7: Verify and open the wp-calypso PR

**Step 1: Full verification**

Run, from the repo root:

```bash
yarn test-apps apps/survicate
yarn test-packages packages/survicate
yarn eslint apps/survicate .teamcity/_self/projects/WPComPlugins.kt 2>/dev/null || yarn eslint apps/survicate
yarn typecheck-apps
cd apps/survicate && yarn build && ls dist && cd -
```

Expected: all green; `dist/` holds `survicate.min.js` and `survicate.asset.json`.

**Step 2: Branch and push**

The worktree branch is `emdash/survicate-jetpack-x-wp-calypso-e28af`. Create the PR branch per `docs/git-workflow.md`:

```bash
git checkout -b add/survicate-wp-admin-bundle
git push -u origin add/survicate-wp-admin-bundle
```

**Step 3: Open a draft PR**

Follow `.github/PULL_REQUEST_TEMPLATE.md`. Proposed description body:

```
## Proposed Changes

Serve wp-admin (Simple and Atomic) the Survicate implementation from `packages/survicate` instead of the hand-written inline script in `jetpack-mu-wpcom`.

- New `apps/survicate/` build layer: a 20-line entry that reads `window.wpcomSurvicateConfig` (emitted by PHP) and calls the package. Built to `dist/survicate.min.js` + `survicate.asset.json`, following `apps/help-center`.
- TeamCity: `survicate.zip` artifact and `survicate-release-build` retention tag.
- Docs: `packages/survicate` now lists wp-admin as a consumer and drops the "keep in sync with the PHP copy" warning.

Design: `docs/plans/2026-09-23-survicate-wp-admin-bundle-design.md`.

## Why are these changes being made?

Two implementations of the same SDK lifecycle and suppression rules had already drifted (the PHP copy lacks the support-session gate and the suppression Tracks event). One source of truth, and suppression changes reach wp-admin with a `deploy wpcom` instead of a Jetpack release.

Companion changes: wpcom `bin/install-plugin.sh` (register the app) and Jetpack `class-survicate.php` (enqueue by URL). Rollout order is documented in the design doc; this PR is safe to merge first since nothing consumes the bundle yet.

## Testing Instructions

1. `yarn test-apps apps/survicate`
2. `cd apps/survicate && yarn build` — `dist/survicate.asset.json` lists `wp-data` and a version hash.
3. Optional end-to-end: sandbox `widgets.wp.com`, `yarn dev --sync`, apply the Jetpack PR to the sandbox, load wp-admin, confirm `survicate.min.js` loads and `window._sva` appears.
```

Mark checklist items honestly; the i18n and a11y items do not apply.

---

## Part B — wpcom

### Task 8: Register the app in `install-plugin.sh`, release, deploy

**Files:**
- Modify (wpcom repo): `bin/install-plugin.sh`

**Step 1: Add the app block**

After the `agents_manager_info` declaration add:

```bash
declare -A survicate_info=(
	[name]='Survicate'
	[files]="widgets.wp.com/survicate"
	[tc_tag]="survicate-release-build"
)
```

**Step 2: Add the lookup and alias cases**

In the function that maps `$1` to an info array (the `case` containing `help-center ) echo "${help_center_info[$1]}" ;;`) add:

```bash
		survicate )                echo "${survicate_info[$1]}" ;;
```

In the slug-normalisation `case` (the one containing `hc ) echo "help-center" ;;`) add:

```bash
		survicate ) echo "survicate" ;;
```

In the help text block add:

```bash
	echo -e "survicate\t\t| \t\t| GitHub branch name \t| install-plugin survicate add/survicate-wp-admin-bundle"
```

**Step 3: Sanity check**

Run: `bash -n bin/install-plugin.sh`
Expected: no output.

Open a wpcom PR with a one-paragraph description pointing at the wp-calypso PR. Merge after the wp-calypso PR has merged and TeamCity has a green `Build Calypso Apps` on trunk.

**Step 4: Release the bundle**

On the sandbox, after both PRs are merged:

```bash
install-plugin.sh survicate --release
```

Pick the WPCOM repository when prompted, merge the generated PR once checks pass, then `deploy wpcom`.

**Step 5: Verify in production (gate for Part C)**

```bash
curl -sI https://widgets.wp.com/survicate/survicate.min.js | head -1
curl -s https://widgets.wp.com/survicate/survicate.asset.json
```

Expected: `HTTP/2 200` and JSON with `dependencies` and `version`. Do not merge Part C until both succeed.

---

## Part C — Jetpack monorepo

Work in a fresh branch off `trunk` in `~/WordPress/a8c-projects/jetpack-atomic` (or a new worktree under `~/WordPress/a8c-projects/jetpack-worktrees/`). Run `jetpack install packages/jetpack-mu-wpcom` once so `composer` dependencies for the PHP tests exist.

### Task 9: Failing PHP tests for the new enqueue

**Files:**
- Modify: `projects/packages/jetpack-mu-wpcom/tests/php/features/survicate/Survicate_Test.php`

**Step 1: Replace the inline-script helper and test**

Delete the helper `get_inline_script()` and the test `test_enqueue_scripts_registers_script_with_expected_inline_js()`.

**Step 2: Add asset stubbing and teardown**

Add to `tear_down()`, before `parent::tear_down();`:

```php
		delete_transient( Survicate::ASSET_TRANSIENT_KEY );
		remove_all_filters( 'pre_http_request' );
```

Add these helpers next to `enqueue_survicate_scripts()`:

```php
	/**
	 * Pretend the bundle's asset manifest was already fetched and cached.
	 *
	 * @param array $asset Decoded asset JSON.
	 */
	private function stub_asset_json( $asset ) {
		set_transient( Survicate::ASSET_TRANSIENT_KEY, $asset, HOUR_IN_SECONDS );
	}

	/**
	 * Helper to read the `before` inline script attached to the bundle handle.
	 *
	 * @return string
	 */
	private function get_before_script() {
		global $wp_scripts;
		$before = $wp_scripts->registered['wpcom-survicate']->extra['before'] ?? array();
		return implode( "\n", array_filter( $before ) );
	}
```

**Step 3: Add the new tests** (in the `enqueue_scripts()` tests section)

```php
	/**
	 * Tests that the shared widgets.wp.com bundle is enqueued with the manifest's dependencies and version.
	 */
	public function test_enqueue_scripts_enqueues_widgets_bundle_with_asset_metadata() {
		global $wp_scripts;

		$this->stub_asset_json(
			array(
				'dependencies' => array( 'wp-data' ),
				'version'      => 'abc123',
			)
		);

		$this->enqueue_survicate_scripts();

		$this->assertTrue( wp_script_is( 'wpcom-survicate', 'enqueued' ) );

		$script = $wp_scripts->registered['wpcom-survicate'];
		$this->assertSame( 'https://widgets.wp.com/survicate/survicate.min.js', $script->src );
		$this->assertSame( array( 'wp-data' ), $script->deps );
		$this->assertSame( 'abc123', $script->ver );
	}

	/**
	 * Tests that the config the bundle reads is emitted before it, and that no inline implementation remains.
	 */
	public function test_enqueue_scripts_emits_config_before_the_bundle() {
		global $wp_scripts;

		$this->stub_asset_json(
			array(
				'dependencies' => array( 'wp-data' ),
				'version'      => 'abc123',
			)
		);

		$this->enqueue_survicate_scripts();

		$before = $this->get_before_script();
		$this->assertStringStartsWith( 'window.wpcomSurvicateConfig = ', $before );
		$this->assertStringContainsString( '"locale":"en_US"', $before );
		$this->assertStringContainsString( '"email":"test@example.com"', $before );
		$this->assertStringContainsString( '"editor_context":"wp-admin"', $before );
		$this->assertStringContainsString( '"is_big_sky_site":"false"', $before );

		$after = array_filter( $wp_scripts->registered['wpcom-survicate']->extra['after'] ?? array() );
		$this->assertSame( array(), $after, 'The inline Survicate implementation must be gone.' );
	}

	/**
	 * Tests that nothing is enqueued when the asset manifest cannot be read.
	 */
	public function test_enqueue_scripts_does_not_enqueue_when_asset_json_is_unavailable() {
		add_filter( 'pre_http_request', static fn () => new \WP_Error( 'offline' ) );

		$this->enqueue_survicate_scripts();

		$this->assertFalse( wp_script_is( 'wpcom-survicate', 'enqueued' ) );
	}

	/**
	 * Tests that a successfully fetched manifest is cached for later requests.
	 */
	public function test_enqueue_scripts_caches_the_asset_json() {
		add_filter(
			'pre_http_request',
			static fn () => array(
				'response' => array( 'code' => 200 ),
				'body'     => wp_json_encode(
					array(
						'dependencies' => array( 'wp-data' ),
						'version'      => 'fetched',
					)
				),
			)
		);

		$this->enqueue_survicate_scripts();

		$cached = get_transient( Survicate::ASSET_TRANSIENT_KEY );
		$this->assertSame( 'fetched', $cached['version'] );
	}
```

**Step 4: Run the tests to verify they fail**

Run: `cd projects/packages/jetpack-mu-wpcom && composer phpunit -- --filter Survicate_Test`
Expected: FAIL. `Survicate::ASSET_TRANSIENT_KEY` undefined, and the enqueue assertions fail against the heredoc implementation.

**Step 5: Commit**

```bash
git add projects/packages/jetpack-mu-wpcom/tests/php/features/survicate/Survicate_Test.php
git commit -m "Survicate: test the widgets.wp.com bundle enqueue"
```

---

### Task 10: Replace the heredoc with the bundle enqueue

**Files:**
- Modify: `projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php`

**Step 1: Replace the constant**

Remove `const WORKSPACE_KEY = '…';` and its docblock. Add:

```php
	/**
	 * The shared Survicate bundle, built from wp-calypso's `apps/survicate` and served from widgets.wp.com.
	 */
	const BUNDLE_URL = 'https://widgets.wp.com/survicate/survicate.min.js';

	/**
	 * Path (without scheme) of the bundle's asset manifest: `dependencies` and `version`.
	 */
	const ASSET_JSON_PATH = 'widgets.wp.com/survicate/survicate.asset.json';

	/**
	 * Transient caching the decoded asset manifest.
	 */
	const ASSET_TRANSIENT_KEY = 'wpcom_survicate_asset_json';
```

**Step 2: Add the manifest reader** (after `get_visitor_traits()`)

```php
	/**
	 * Reads the bundle's asset manifest: from disk on WordPress.com, over the
	 * network on Atomic. Cached for an hour. Returns null when unavailable so
	 * the caller can skip Survicate entirely — surveys are optional and must
	 * never break wp-admin.
	 *
	 * @return array|null Decoded manifest with `dependencies` and `version`, or null.
	 */
	private function get_asset_json() {
		$asset = get_transient( self::ASSET_TRANSIENT_KEY );
		if ( is_array( $asset ) ) {
			return $asset;
		}

		$local_path = ABSPATH . '/' . self::ASSET_JSON_PATH;
		if ( file_exists( $local_path ) ) {
			$asset = json_decode( file_get_contents( $local_path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		} else {
			$response = wp_remote_get( 'https://' . self::ASSET_JSON_PATH );
			if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
				return null;
			}
			$asset = json_decode( wp_remote_retrieve_body( $response ), true );
		}

		if ( ! is_array( $asset ) || empty( $asset['version'] ) ) {
			return null;
		}

		set_transient( self::ASSET_TRANSIENT_KEY, $asset, HOUR_IN_SECONDS );

		return $asset;
	}
```

**Step 3: Rewrite `enqueue_scripts()`**

Replace the whole method (from its docblock through the closing `}` after `wp_enqueue_script( 'wpcom-survicate' );`) with:

```php
	/**
	 * Enqueue the shared Survicate bundle and the config it reads.
	 *
	 * PHP decides whether the user, screen and site are eligible and which
	 * site-level traits to attach; the bundle owns the SDK lifecycle and the
	 * survey suppression rules (see `packages/survicate` in wp-calypso).
	 */
	public function enqueue_scripts() {
		if ( ! $this->should_load() ) {
			return;
		}

		$asset = $this->get_asset_json();
		if ( null === $asset ) {
			return;
		}

		wp_enqueue_script(
			'wpcom-survicate',
			self::BUNDLE_URL,
			$asset['dependencies'] ?? array(),
			$asset['version'],
			true
		);

		$config = array(
			'locale' => get_user_locale(),
			'traits' => $this->get_visitor_traits(),
		);

		wp_add_inline_script(
			'wpcom-survicate',
			'window.wpcomSurvicateConfig = ' . wp_json_encode( $config, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP ) . ';',
			'before'
		);
	}
```

**Step 4: Run the tests to verify they pass**

Run: `cd projects/packages/jetpack-mu-wpcom && composer phpunit -- --filter Survicate_Test`
Expected: PASS, every test in the file (the pre-existing `should_load`, `get_editor_context`, `get_visitor_traits` and singleton tests are untouched and must still pass).

**Step 5: Lint**

Run, from the monorepo root: `vendor/bin/phpcs -p projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php projects/packages/jetpack-mu-wpcom/tests/php/features/survicate/Survicate_Test.php`
Expected: no errors. If `vendor/bin/phpcs` is missing, run `composer install` at the monorepo root first.

**Step 6: Commit**

```bash
git add projects/packages/jetpack-mu-wpcom/src/features/survicate/class-survicate.php
git commit -m "Survicate: load the shared widgets.wp.com bundle instead of an inline script"
```

---

### Task 11: Changelog entry

**Files:**
- Create: `projects/packages/jetpack-mu-wpcom/changelog/update-survicate-shared-bundle`

**Step 1: Create the entry**

Either run `jetpack changelog add packages/jetpack-mu-wpcom` and answer the prompts (significance `patch`, type `changed`), or write the file directly:

```
Significance: patch
Type: changed

Survicate: load the shared wp-calypso bundle from widgets.wp.com instead of an inline script.
```

**Step 2: Commit**

```bash
git add projects/packages/jetpack-mu-wpcom/changelog/update-survicate-shared-bundle
git commit -m "Survicate: changelog"
```

---

### Task 12: Sandbox verification and Jetpack PR

**Step 1: Verify on a sandboxed Simple site**

Sync the branch to the sandbox (Unison or the mu-wpcom sync process in `docs/development-environment.md`), sandbox `widgets.wp.com` if the wp-calypso bundle is not yet in production, then load any wp-admin page as an English-locale user and confirm in DevTools:

- Network: `survicate.min.js` loads from `widgets.wp.com` with `?ver=<hash>`; no request for an inline `wpcom-survicate` handle body.
- Console: `window.wpcomSurvicateConfig` has `locale` and `traits`; `window._sva` exists after a moment; `localStorage.debug = 'survicate*'` then reload shows `Loading Survicate script for workspace …` and `Visitor traits set: …`.
- Open the Help Center: any visible survey closes and `_sva.disableTargeting` becomes `true`; close it and the flag clears.
- Switch the user locale to `fr_FR`: no `wpcom-survicate` script at all.

**Step 2: Verify on an Atomic site**

Repeat the Network and Console checks on an Atomic site once the bundle is in production (Task 8, step 5). The first page load fetches the manifest over the network; subsequent loads within the hour do not.

**Step 3: Open the Jetpack PR**

Branch name `update/survicate-shared-bundle`. Description: what moved where, link the wp-calypso PR, and state that it must not merge before Task 8 step 5 is green. Include the manual checks above as testing instructions.

---

## Follow-ups (out of scope, record as issues)

1. **Support sessions in wp-admin.** Emit a `supportSession: true` flag from PHP when a Happiness Engineer is proxied in, and have the entry skip `shouldLoadSurvicate` when set. Needs a reliable PHP signal first.
2. **Tracks host attribution.** Pass `{ host: 'wp-admin' }` through to `recordSurveySuppressed` from the bundle (a `properties` argument already exists) so the suppression event can be split by surface.
3. **Delete the design doc's "not yet implemented" status** once Part C ships.
