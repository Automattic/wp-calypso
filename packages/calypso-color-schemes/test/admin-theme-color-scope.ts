/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';

const GENERATED = path.join(
	__dirname,
	'..',
	'src',
	'__wp-base-styles',
	'_admin-theme-colors.scss'
);

const read = () => fs.readFileSync( GENERATED, 'utf8' );

describe( 'admin theme colour scoping', () => {
	it( 'confines every rule to the Stats root', () => {
		const selectors = read()
			.split( '\n' )
			.filter( ( line ) => line.trim().endsWith( '{' ) && ! line.startsWith( '@' ) )
			.map( ( line ) => line.replace( '{', '' ).trim() );

		expect( selectors.length ).toBeGreaterThan( 0 );
		selectors.forEach( ( selector ) => {
			expect( selector ).toContain( '.stats-main' );
		} );
	} );

	it( 'never sets the token on <body>, which would reach the whole of Calypso', () => {
		const selectors = read()
			.split( '\n' )
			.filter( ( line ) => line.trim().endsWith( '{' ) && ! line.startsWith( '@' ) )
			.map( ( line ) => line.replace( '{', '' ).trim() );

		// `body.is-<scheme> .stats-main` is fine — the declaration lands on the descendant.
		// `body…{` with no descendant would apply the colour document-wide.
		selectors
			.filter( ( selector ) => selector.startsWith( 'body' ) )
			.forEach( ( selector ) => {
				expect( selector ).toMatch( /^body[^ ]* \.stats-main$/ );
			} );
	} );

	it( 'inherits rather than restating the colour on the Odyssey Stats root', () => {
		// In wp-admin the surrounding page already defines the token, and that value is
		// authoritative for the site's WordPress version — restating our own would drift.
		const odysseyBlock = read().match( /\.stats-main\.color-scheme\.is-coffee \{([^}]*)\}/ );

		expect( odysseyBlock ).not.toBeNull();
		expect( odysseyBlock?.[ 1 ] ).toContain( '--wp-admin-theme-color: inherit;' );
		expect( odysseyBlock?.[ 1 ] ).not.toMatch( /#[0-9a-f]{6}/i );
	} );
} );
