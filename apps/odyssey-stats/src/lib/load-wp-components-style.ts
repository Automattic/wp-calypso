import config, { optionalConfig } from './config-api';

/**
 * The WP release whose command palette enqueues `wp-components` globally across wp-admin, making
 * `@wordpress/components`' base CSS available to us on every admin page. Core added
 * `wp_enqueue_command_palette_assets` to `admin_enqueue_scripts` in 6.9.0.
 */
const WP_VERSION_WITH_GLOBAL_WP_COMPONENTS = '6.9';

/**
 * The `stats-admin` release that declares `wp-components` as a dependency of Odyssey's own
 * stylesheet (Automattic/jetpack#50881), guaranteeing it regardless of WP version. `stats-admin` is
 * at 0.31.11 as of that PR; its changelog entry is `Significance: minor`, which resolves to 0.32.0
 * on release — bump this to match if that turns out wrong when it actually ships.
 */
const STATS_ADMIN_VERSION_WITH_WP_COMPONENTS_DEP = '0.32.0';

/**
 * Numeric dot-segment comparison, enough for the `7.0.2`-style version string `stats-admin` reports.
 * Returns false for anything unparseable, so an unexpected value falls back to loading our own copy
 * rather than silently leaving the app unstyled.
 */
function isAtLeast( version: unknown, minimum: string ): boolean {
	if ( typeof version !== 'string' ) {
		return false;
	}

	const actual = version.split( '.' ).map( ( part ) => parseInt( part, 10 ) );
	const required = minimum.split( '.' ).map( ( part ) => parseInt( part, 10 ) );

	if ( actual.some( Number.isNaN ) ) {
		return false;
	}

	for ( let i = 0; i < required.length; i++ ) {
		const left = actual[ i ] ?? 0;
		const right = required[ i ] ?? 0;
		if ( left !== right ) {
			return left > right;
		}
	}

	return true;
}

/**
 * Whether wp-admin already serves `@wordpress/components`' base CSS, making our own copy redundant.
 *
 * Two independent signals, either one sufficient:
 *
 * - `stats_admin_version` — the real contract: Jetpack declaring `wp-components` as a dependency of
 *   our own stylesheet. Reaches a site only once its Jetpack plugin updates.
 * - `software_version` — WP 6.9+ enqueues `wp-components` globally for the command palette. That's
 *   an implementation detail of the palette, not a promise to us, but it's true today regardless of
 *   Jetpack version, so checking it means an un-updated Jetpack on a WP 6.9+ site still gets exactly
 *   one copy instead of two (harmless — nothing to collide with below 6.9 either way — but wasteful).
 *
 * Exported for tests: the version parsing is the only real logic here, and getting it wrong in
 * either direction is costly — too eager and we double-load and collide, too shy and the app
 * renders unstyled.
 */
export function isProvidedByWpAdmin(): boolean {
	return (
		isAtLeast( siteVersion( 'stats_admin_version' ), STATS_ADMIN_VERSION_WITH_WP_COMPONENTS_DEP ) ||
		isAtLeast( siteVersion( 'software_version' ), WP_VERSION_WITH_GLOBAL_WP_COMPONENTS )
	);
}

/**
 * Whether the dashboard already serves `@wordpress/components`' base CSS to the widget.
 *
 * `stats_admin_version` is no signal here: Jetpack enqueues the widget without Odyssey's own
 * stylesheet, which is what carries that dependency. So it is the WP version, or the page itself.
 */
export function isProvidedToWidget(): boolean {
	return (
		isAtLeast( siteVersion( 'software_version' ), WP_VERSION_WITH_GLOBAL_WP_COMPONENTS ) ||
		isStyleOnPage( 'wp-components' )
	);
}

/**
 * Whether the page links a stylesheet handle, alone or inside wp-admin's concatenated
 * `load-styles.php` request, which carries no per-handle id.
 * @param handle The style handle.
 */
function isStyleOnPage( handle: string ): boolean {
	if ( document.getElementById( `${ handle }-css` ) ) {
		return true;
	}

	return Array.from(
		document.querySelectorAll< HTMLLinkElement >( 'link[href*="load-styles.php"]' )
	).some( ( link ) =>
		Array.from( new URL( link.href, document.baseURI ).searchParams )
			.filter( ( [ key ] ) => key.startsWith( 'load' ) )
			.some( ( [ , handles ] ) => handles.split( ',' ).includes( handle ) )
	);
}

/**
 * A version the site reports.
 * @param key `stats_admin_version` or `software_version`.
 */
function siteVersion( key: 'stats_admin_version' | 'software_version' ): unknown {
	// Also served at the top level, which is the only place they appear on a site with no
	// WordPress.com connection: `intial_state` is keyed by blog id. The nested read stays as the
	// fallback, since the JS ships from a CDN and can meet a `stats-admin` old enough to place
	// them only inside the dashboard's state.
	const siteOptions =
		optionalConfig( 'intial_state' )?.sites?.items?.[ config( 'blog_id' ) as number ]?.options ??
		{};

	return optionalConfig( key ) ?? siteOptions[ key ];
}

const importStyle = () =>
	import(
		/* webpackChunkName: "wp-components-style" */
		'odyssey-wp-components-style'
	);

/**
 * Loads our own copy of `@wordpress/components`' base CSS, but only when nothing on the page
 * already provides it.
 *
 * Odyssey's JS externalizes `@wordpress/components` to wp-admin's own `wp.components`, so when
 * wp-admin already has the matching stylesheet, bundling a second copy is worse than redundant: the
 * two are independently versioned and disagree (core sets `.components-modal__frame` to
 * `min-width: 350px; margin: auto`, ours to `320px` / `margin: 0`), and because these class names
 * are unnamespaced, ours leaked onto wp-admin's own component instances — which is what left WP
 * 7.0's command palette off-centre with the wrong padding (STATS-251).
 *
 * When neither signal holds, nothing provides it, so we load it as its own chunk. Those sites have
 * no command palette either, since both providers postdate it — nothing to collide with.
 */
export default async function loadWpComponentsStyle(): Promise< void > {
	if ( isProvidedByWpAdmin() ) {
		return;
	}

	await importStyle();
}

/**
 * The dashboard widget's counterpart to `loadWpComponentsStyle`.
 */
export async function loadWpComponentsStyleForWidget(): Promise< void > {
	if ( isProvidedToWidget() ) {
		return;
	}

	await importStyle();
}
