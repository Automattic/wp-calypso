const { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require( 'fs' );
const { basename, dirname, join } = require( 'path' );

function copyAsset( assetPath, targetName ) {
	if ( ! targetName ) {
		targetName = basename( assetPath );
	}

	const target = join( __dirname, '..', 'src', '__color-studio', targetName );

	if ( ! existsSync( dirname( target ) ) ) {
		mkdirSync( dirname( target ), { recursive: true } );
	}

	copyFileSync( require.resolve( assetPath ), join( target ) );
}

const REQUIRED_SCHEMES = [
	'blue',
	'coffee',
	'ectoplasm',
	'light',
	'midnight',
	'modern',
	'ocean',
	'sunrise',
];

// wp-admin's default scheme. Core publishes it as an unconditional `:root` value rather than a
// `body.admin-color-fresh` block, so it is absent from the mixin `parseAdminSchemes` reads. Odyssey
// inherits it from wp-admin like any other; leaving it out here would make the two environments
// disagree on the most common scheme of all.
const FRESH_ADMIN_THEME_COLOR = '#3858e9';

function parseAdminSchemes( source ) {
	// `\n\}` must stay anchored to column 0: the inner `body.admin-color-*` blocks close
	// with an indented brace, so loosening this to allow leading whitespace makes the
	// non-greedy match stop at the first scheme and silently capture only one of eight.
	const block = source.match( /@mixin\s+wordpress-admin-schemes\(\)\s*\{([\s\S]*?)\n\}/ );

	if ( ! block ) {
		throw new Error(
			'Could not find the wordpress-admin-schemes() mixin in @wordpress/base-styles. ' +
				'The upstream format changed — update parseAdminSchemes().'
		);
	}

	const schemes = {};
	const entry =
		/body\.admin-color-([a-z-]+)\s*\{\s*@include\s+admin-scheme\(\s*(#[0-9a-f]{3,8})\s*\)/gi;
	let match;

	while ( ( match = entry.exec( block[ 1 ] ) ) !== null ) {
		schemes[ match[ 1 ] ] = match[ 2 ].toLowerCase();
	}

	const missing = REQUIRED_SCHEMES.filter( ( name ) => ! schemes[ name ] );

	if ( missing.length ) {
		// Both causes land here — a scheme genuinely removed upstream, and a scheme still present in
		// a form the `entry` regex no longer recognises (a declaration or comment before the
		// `@include`, a variable instead of a literal hex, an extra argument). Naming what was found
		// tells the two apart; without it the message sends you looking for a `body.admin-color-blue`
		// block that is sitting right there.
		throw new Error(
			`Found the wordpress-admin-schemes() mixin and extracted ${
				Object.keys( schemes ).length
			} scheme(s) (${ Object.keys( schemes ).join( ', ' ) || 'none' }), but not: ${ missing.join(
				', '
			) }. Either @wordpress/base-styles dropped them, or ` +
				'they no longer match the `@include admin-scheme(#hex)` form the `entry` regex ' +
				'expects — check the mixin and update parseAdminSchemes().'
		);
	}

	return schemes;
}

function getAdminSchemes( source ) {
	return { fresh: FRESH_ADMIN_THEME_COLOR, ...parseAdminSchemes( source ) };
}

// Every root that includes `stats-interactive-colors` in Calypso. The mixin reads
// `--wp-admin-theme-color`; this list is what sets it. The two must name the same elements — a root
// that includes the mixin without appearing here re-points its accents at a token nothing defined,
// which silently resolves to whatever <body> inherited.
//
// `.woocommerce`, not `.store-stats`: Store Stats mounts as `store-stats woocommerce` on its main
// page but `store-stats__list-view woocommerce` on Products, Categories and Coupons
// (client/my-sites/store/app/store-stats/listview.jsx), so `.woocommerce` is the only class common
// to all of them — and it is the one client/my-sites/store/style.scss includes the mixin on.
const CALYPSO_STATS_ROOTS = [ '.stats-main', '.woocommerce' ];

// Stats modals, popovers and tooltips render at the document root, outside those subtrees, so they
// need the token too. They are qualified with `.is-section-stats` — the class Calypso puts on
// <body> for the section — because the roots themselves are generic: an unqualified `.popover`
// would recolour every popover in Calypso.
//
// Odyssey recognises an overlapping but different set in apps/odyssey-stats/webpack-css-scope.js:
// it routes Popover through `.color-scheme` and so has no `.popover`, and it treats
// `.components-popover__fallback-container` as an entry-point root rather than a portal root. Don't
// sync the two lists — they answer different questions.
const CALYPSO_PORTAL_ROOTS = [
	'.popover',
	'[data-base-ui-portal]',
	'.components-modal__screen-overlay',
	'.components-popover__fallback-container',
	'[data-wp-compat-overlay-slot]',
	'.ReactModalPortal',
];

// Every selector is anchored to `body`, where Calypso puts the scheme class. These rules do reach
// Odyssey (via client/assets/stylesheets/style.scss and src/styles/widget-base.scss) but are inert
// there: wp-admin's <body> carries `admin-color-<scheme>`, never `is-<scheme>`. Odyssey takes the
// colour straight from wp-admin and hands the property back from its own
// apps/odyssey-stats/src/styles/_admin-theme-handback.scss rather than taking a value from here.
//
// Iterates the schemes it is given rather than REQUIRED_SCHEMES, which is only the floor: a scheme
// added upstream should appear in the output, not be dropped because this file has not caught up.
function buildAdminThemeColors( schemes ) {
	const blocks = Object.keys( schemes )
		.sort()
		.map( ( name ) => {
			const hex = schemes[ name ];
			const calypsoSelector = [
				`body.is-${ name } :is(${ CALYPSO_STATS_ROOTS.join( ', ' ) })`,
				`body.is-${ name }.is-section-stats :is(${ CALYPSO_PORTAL_ROOTS.join( ', ' ) })`,
			].join( ',\n' );

			return [
				`${ calypsoSelector } {`,
				`\t--wp-admin-theme-color: ${ hex };`,
				`\t--wp-admin-theme-color-darker-10: #{color.adjust(${ hex }, $lightness: -5%)};`,
				`\t--wp-admin-theme-color-darker-20: #{color.adjust(${ hex }, $lightness: -10%)};`,
				'}',
			].join( '\n' );
		} );

	return [
		'// Generated by bin/prepare-sass-assets.js from @wordpress/base-styles. Do not edit.',
		'',
		'@use "sass:color";',
		'',
		...blocks,
		'',
	].join( '\n' );
}

function generateAdminThemeColors() {
	const source = readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' );
	const target = join( __dirname, '..', 'src', '__wp-base-styles', '_admin-theme-colors.scss' );

	if ( ! existsSync( dirname( target ) ) ) {
		mkdirSync( dirname( target ), { recursive: true } );
	}

	writeFileSync( target, buildAdminThemeColors( getAdminSchemes( source ) ) );
}

module.exports = {
	parseAdminSchemes,
	getAdminSchemes,
	buildAdminThemeColors,
	CALYPSO_STATS_ROOTS,
	CALYPSO_PORTAL_ROOTS,
	FRESH_ADMIN_THEME_COLOR,
	REQUIRED_SCHEMES,
};

if ( require.main === module ) {
	copyAsset( '@automattic/color-studio/dist/color-properties.css' );
	generateAdminThemeColors();
}
