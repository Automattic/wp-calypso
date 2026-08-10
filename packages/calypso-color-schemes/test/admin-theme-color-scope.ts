/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parseAdminSchemes, buildAdminThemeColors } = require( '../bin/prepare-sass-assets' );

const SCHEME_DIR = path.join( __dirname, '..', 'src', 'shared', 'color-schemes' );

const CORE_MIRRORING = [
	'blue',
	'coffee',
	'ectoplasm',
	'light',
	'midnight',
	'modern',
	'ocean',
	'sunrise',
];

// Built here rather than read from src/__wp-base-styles, which is generated and git-ignored:
// that file survives branch switches, so asserting against it fails for reasons unrelated to
// the code under test.
const selectors = (): string[] =>
	buildAdminThemeColors(
		parseAdminSchemes(
			fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
		)
	)
		.split( '\n' )
		.filter( ( line: string ) => line.trim().endsWith( '{' ) && ! line.startsWith( '@' ) )
		.map( ( line: string ) => line.replace( '{', '' ).trim() );

describe( 'admin theme colour scoping', () => {
	it( 'anchors every rule to <body>', () => {
		// Odyssey puts the scheme class on a nested element and leaves <body> to wp-admin. A bare
		// `.color-scheme.is-<scheme>` selector would match that element and clobber the value
		// wp-admin already set — the exact bug this work exists to fix.
		expect( selectors().length ).toBeGreaterThan( 0 );
		selectors().forEach( ( selector ) => {
			expect( selector ).toMatch( /^body\.color-scheme\.is-[a-z-]+$/ );
		} );
	} );

	it( 'leaves the token to core in the schemes that mirror wp-admin', () => {
		CORE_MIRRORING.forEach( ( name ) => {
			const partial = fs.readFileSync( path.join( SCHEME_DIR, `_${ name }.scss` ), 'utf8' );
			expect( partial ).not.toContain( '--wp-admin-theme-color' );
		} );
	} );

	it( 'keeps the accent alias for schemes with no wp-admin equivalent', () => {
		// These have no admin-scheme counterpart in @wordpress/base-styles, so there is no core
		// value to adopt and their accent already meets AA.
		[ 'default', 'fresh', 'sakura', 'aquatic', 'global', 'jetpack-cloud' ].forEach( ( name ) => {
			const partial = fs.readFileSync( path.join( SCHEME_DIR, `_${ name }.scss` ), 'utf8' );
			expect( partial ).toContain( '--wp-admin-theme-color: var(--color-accent)' );
		} );
	} );

	it( 'aliases all three shades wherever it aliases any', () => {
		// The button overrides resolve the two darker shades as well as the base. A scheme that
		// aliased only some would fall back to whichever ancestor last declared the rest — in
		// practice `:root`, whose accent is not that scheme's — so hover and active states would
		// silently pick up the wrong colour. Substitution happens where the property is declared,
		// so each shade has to be declared in the same block as the accent it derives from.
		fs.readdirSync( SCHEME_DIR )
			.filter( ( file ) => file.endsWith( '.scss' ) )
			.forEach( ( file ) => {
				const partial = fs.readFileSync( path.join( SCHEME_DIR, file ), 'utf8' );

				if ( ! partial.includes( '--wp-admin-theme-color:' ) ) {
					return;
				}

				expect( [ file, partial.includes( '--wp-admin-theme-color-darker-10:' ) ] ).toEqual( [
					file,
					true,
				] );
				expect( [ file, partial.includes( '--wp-admin-theme-color-darker-20:' ) ] ).toEqual( [
					file,
					true,
				] );
			} );
	} );
} );
