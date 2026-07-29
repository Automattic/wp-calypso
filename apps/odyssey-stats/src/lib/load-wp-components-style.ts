import config from './config-api';

/**
 * The WP release whose command palette enqueues `wp-components` globally across wp-admin, making
 * `@wordpress/components`' base CSS available to us on every admin page.
 */
const WP_VERSION_WITH_GLOBAL_WP_COMPONENTS = '7.0';

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
 * Exported for tests: the version parsing is the only real logic here, and getting it wrong in
 * either direction is costly — too eager and we double-load and collide, too shy and the app
 * renders unstyled.
 */
export function isProvidedByWpAdmin(): boolean {
	const siteOptions =
		config( 'intial_state' )?.sites?.items?.[ config( 'blog_id' ) as number ]?.options ?? {};

	return isAtLeast( siteOptions.software_version, WP_VERSION_WITH_GLOBAL_WP_COMPONENTS );
}

/**
 * Loads our own copy of `@wordpress/components`' base CSS, but only on WP versions where wp-admin
 * doesn't already serve it.
 *
 * Odyssey's JS externalizes `@wordpress/components` to wp-admin's own `wp.components`, so on WP 7.0+
 * the matching stylesheet is already on the page and bundling a second copy is worse than
 * redundant: the two are independently versioned and disagree (core sets `.components-modal__frame`
 * to `min-width: 350px; margin: auto`, ours to `320px` / `margin: 0`), and because these class names
 * are unnamespaced, ours leaked onto wp-admin's own component instances — which is what left WP
 * 7.0's command palette off-centre with the wrong padding (STATS-251).
 *
 * Below 7.0 nothing provides it, so we load it as its own chunk. Those versions have no command
 * palette, so there is nothing for it to collide with there.
 */
export default async function loadWpComponentsStyle(): Promise< void > {
	if ( isProvidedByWpAdmin() ) {
		return;
	}

	await import(
		/* webpackChunkName: "wp-components-style" */
		'odyssey-wp-components-style'
	);
}
