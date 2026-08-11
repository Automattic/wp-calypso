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
const CALYPSO_PORTAL_ROOTS = [
	'.popover',
	'[data-base-ui-portal]',
	'.components-modal__screen-overlay',
	'.components-popover__fallback-container',
	'[data-wp-compat-overlay-slot]',
	'.ReactModalPortal',
];

const targetsCalypsoPortal = ( selector: string ) =>
	CALYPSO_PORTAL_ROOTS.some( ( r ) => selector.includes( r ) );

describe( 'admin theme colour scoping', () => {
	it( 'confines every rule to a Stats surface', () => {
		expect( selectors().length ).toBeGreaterThan( 0 );
		selectors().forEach( ( selector ) => {
			const onStatsRoot = STATS_ROOTS.some( ( root ) => selector.includes( root ) );
			expect( onStatsRoot || targetsCalypsoPortal( selector ) ).toBe( true );
		} );
	} );

	it( 'qualifies the generic Calypso portal roots with the Stats section', () => {
		// `.popover` and friends are used throughout Calypso. Without `.is-section-stats` these
		// rules would recolour every popover and modal in the product.
		const portalSelectors = selectors().filter( targetsCalypsoPortal );

		expect( portalSelectors.length ).toBeGreaterThan( 0 );
		portalSelectors.forEach( ( selector ) => {
			expect( selector ).toContain( '.is-section-stats' );
		} );
	} );

	it( 'leaves the Odyssey roots alone', () => {
		// Odyssey hands the property back to wp-admin from its own styles rather than taking a value
		// from here, so a rule in this package naming one of its mounts would fight that.
		selectors().forEach( ( selector ) => {
			expect( selector ).not.toContain( '.stats-widget-content' );
			expect( selector ).not.toMatch( /\.color-scheme\.is-/ );
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

	it( 'states a colour on every rule rather than inheriting one', () => {
		// `inherit` is Odyssey's mechanism, for taking back what wp-admin already set. Calypso has
		// no such value to inherit, so a rule here that used it would resolve to nothing.
		expect( generated() ).not.toContain( 'inherit' );
	} );
} );
