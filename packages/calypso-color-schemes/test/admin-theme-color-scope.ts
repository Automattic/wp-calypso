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

const selectors = (): string[] =>
	generated()
		.split( '\n' )
		.filter( ( line ) => line.trim().endsWith( '{' ) && ! line.startsWith( '@' ) )
		.map( ( line ) => line.replace( '{', '' ).trim() );

describe( 'admin theme colour scoping', () => {
	it( 'confines every rule to the Stats root', () => {
		expect( selectors().length ).toBeGreaterThan( 0 );
		selectors().forEach( ( selector ) => {
			expect( selector ).toContain( '.stats-main' );
		} );
	} );

	it( 'never sets the token on <body>, which would reach the whole of Calypso', () => {
		// `body.is-<scheme> .stats-main` is fine — the declaration lands on the descendant.
		// A `body…{` selector with no descendant would apply the colour document-wide.
		selectors()
			.filter( ( selector ) => selector.startsWith( 'body' ) )
			.forEach( ( selector ) => {
				expect( selector ).toMatch( /^body[^ ]* \.stats-main$/ );
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
