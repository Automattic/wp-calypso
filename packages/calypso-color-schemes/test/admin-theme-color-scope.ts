/**
 * @jest-environment node
 */
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseAdminSchemes, buildAdminThemeColors } = require( '../bin/prepare-sass-assets' );

// Built here rather than read from src/__wp-base-styles, which is generated and git-ignored:
// that file survives branch switches, so asserting against it fails for reasons unrelated to
// the code under test.
const generated = (): string =>
	buildAdminThemeColors(
		parseAdminSchemes(
			fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
		)
	);

// Selector lines are the unindented ones: declarations are tab-indented, and splitting on braces
// would break on the `}` inside Sass interpolations like `#{color.adjust(…)}`. A group can span
// several lines, so join them before splitting on the commas that separate selectors.
const selectors = (): string[] =>
	generated()
		.split( '\n' )
		.filter(
			( line ) =>
				line.trim() &&
				! /^[\s}]/.test( line ) &&
				! line.startsWith( '//' ) &&
				! line.startsWith( '@' )
		)
		.join( ' ' )
		.replace( /\{/g, ',' )
		.split( /,(?![^(]*\))/ )
		.map( ( selector ) => selector.replace( /\s+/g, ' ' ).trim() )
		.filter( Boolean );

const STATS_ROOTS = [ '.stats-main', '.store-stats' ];
const PORTAL_ROOTS = [
	'.popover',
	'[data-base-ui-portal]',
	'.components-modal__screen-overlay',
	'.components-popover__fallback-container',
	'.ReactModalPortal',
];

const targetsPortal = ( selector: string ) => PORTAL_ROOTS.some( ( r ) => selector.includes( r ) );

describe( 'admin theme colour scoping', () => {
	it( 'confines every rule to a Stats surface', () => {
		expect( selectors().length ).toBeGreaterThan( 0 );
		selectors().forEach( ( selector ) => {
			const onStatsRoot = STATS_ROOTS.some( ( root ) => selector.includes( root ) );
			expect( onStatsRoot || targetsPortal( selector ) ).toBe( true );
		} );
	} );

	it( 'qualifies the generic portal roots with the Stats section', () => {
		// `.popover` and friends are used throughout Calypso. Without `.is-section-stats` these
		// rules would recolour every popover and modal in the product.
		const portalSelectors = selectors().filter( targetsPortal );

		expect( portalSelectors.length ).toBeGreaterThan( 0 );
		portalSelectors.forEach( ( selector ) => {
			expect( selector ).toContain( '.is-section-stats' );
		} );
	} );

	it( 'never sets the token on <body> itself, which would reach the whole of Calypso', () => {
		// A body-anchored selector must have a descendant part, so the declaration lands inside
		// Stats rather than on the document.
		selectors()
			.filter( ( selector ) => selector.startsWith( 'body' ) )
			.forEach( ( selector ) => {
				expect( selector ).toMatch( /^body\S* \S/ );
			} );
	} );

	it( 'inherits rather than restating the colour on the Odyssey Stats root', () => {
		// In wp-admin the surrounding page already defines the token, and that value is
		// authoritative for the site's WordPress version — restating our own would drift.
		const odysseyBlock = generated().match( /\.stats-main\.color-scheme\.is-coffee \{([^}]*)\}/ );

		expect( odysseyBlock ).not.toBeNull();
		expect( odysseyBlock?.[ 1 ] ).toContain( '--wp-admin-theme-color: inherit;' );
		expect( odysseyBlock?.[ 1 ] ).not.toMatch( /#[0-9a-f]{6}/i );
	} );
} );
