/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import * as sass from 'sass';
const {
	getAdminSchemes,
	buildAdminThemeColors,
	// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require( '../bin/prepare-sass-assets' );

// Built here rather than read from src/__wp-base-styles, which is generated and git-ignored:
// that file survives branch switches, so asserting against it fails for reasons unrelated to
// the code under test.
const schemes = (): Record< string, string > =>
	getAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

// The generated file now emits a map and a mixin rather than rules, so these tests compile it with
// the real Sass rather than parsing the source string. That covers what a string check cannot: that
// the file is valid Sass, that `color.adjust` resolves, and that the selectors a caller ends up with
// are the ones intended.
const compile = ( usage: string ): string =>
	sass.compileString( `${ buildAdminThemeColors( schemes() ) }\n${ usage }` ).css;

const PORTAL_ROOTS = '".popover, [data-base-ui-portal], .ReactModalPortal"';

interface Block {
	selector: string;
	declarations: Record< string, string >;
}

const parseBlocks = ( css: string ): Block[] =>
	[ ...css.matchAll( /([^{}]+)\{([^}]*)\}/g ) ].map( ( [ , selector, body ] ) => ( {
		selector: selector.replace( /\s+/g, ' ' ).trim(),
		declarations: Object.fromEntries(
			body
				.split( ';' )
				.map( ( d ) => d.trim() )
				.filter( Boolean )
				.map( ( d ) => {
					const at = d.indexOf( ':' );
					return [ d.slice( 0, at ).trim(), d.slice( at + 1 ).trim() ];
				} )
		),
	} ) );

describe( 'admin theme colour declarations', () => {
	it( 'emits one block per scheme per call, and drops none of them', () => {
		const names = Object.keys( schemes() );
		const blocks = parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) );

		expect( names.length ).toBeGreaterThan( 0 );
		expect( blocks ).toHaveLength( names.length );
	} );

	it( 'sets the admin theme token — not some other property — to each scheme’s own colour', () => {
		// Guards the whole point of the package: a block that named a different property, or reused
		// one scheme’s hex for every block, would still satisfy every selector-shaped assertion.
		const blocks = parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) );

		Object.entries( schemes() ).forEach( ( [ name, hex ] ) => {
			const block = blocks.find( ( b ) => b.selector.startsWith( `body.is-${ name } ` ) );

			expect( block ).toBeDefined();
			expect( block?.declarations[ '--wp-admin-theme-color' ] ).toBe( hex );
		} );
	} );

	it( 'derives both darker shades the way core does, and keeps them distinct', () => {
		// Core uses color.adjust($c, $lightness: -5%/-10%); matching that is what makes Calypso and
		// wp-admin agree. Collapsing them to one value is the pre-existing bug this replaces, where
		// hover and focus rendered identically.
		parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) ).forEach(
			( { declarations } ) => {
				const base = declarations[ '--wp-admin-theme-color' ];
				const d10 = declarations[ '--wp-admin-theme-color-darker-10' ];
				const d20 = declarations[ '--wp-admin-theme-color-darker-20' ];

				expect( d10 ).toBeDefined();
				expect( d20 ).toBeDefined();
				expect( new Set( [ base, d10, d20 ] ).size ).toBe( 3 );
			}
		);
	} );

	it( 'produces the exact shades wp-admin publishes, for a scheme verified against a real install', () => {
		// Measured on a WP 7.0 site: body.admin-color-sunrise resolves to these three values.
		const block = parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) ).find(
			( b ) => b.selector.startsWith( 'body.is-sunrise ' )
		);

		expect( block?.declarations ).toMatchObject( {
			'--wp-admin-theme-color': '#dd823b',
			'--wp-admin-theme-color-darker-10': '#d97426',
			'--wp-admin-theme-color-darker-20': '#c36922',
		} );
	} );

	it( 'covers fresh, the wp-admin default that upstream omits from the mixin', () => {
		expect( schemes().fresh ).toBeDefined();
		expect( compile( '@include wp-admin-theme-colors(".stats-main");' ) ).toContain(
			'body.is-fresh'
		);
	} );
} );

describe( 'admin theme colour scoping', () => {
	it( 'confines every rule to the roots the caller named', () => {
		const blocks = parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) );

		expect( blocks.length ).toBeGreaterThan( 0 );
		blocks.forEach( ( { selector } ) => {
			expect( selector ).toContain( '.stats-main' );
		} );
	} );

	it( 'compounds the body qualifier rather than nesting a second body', () => {
		// `body.is-blue.is-section-stats :is(…)`, never `body.is-blue body.is-section-stats :is(…)`,
		// which is what plain nesting would produce and which can never match.
		const blocks = parseBlocks(
			compile( `@include wp-admin-theme-colors(${ PORTAL_ROOTS }, ".is-section-stats");` )
		);

		expect( blocks.length ).toBeGreaterThan( 0 );
		blocks.forEach( ( { selector } ) => {
			expect( selector ).toMatch( /^body\.is-[a-z-]+\.is-section-stats :is\(/ );
			expect( selector.match( /body/g ) ).toHaveLength( 1 );
		} );
	} );

	it( 'never sets the token on <body> itself, which would reach the whole of Calypso', () => {
		const blocks = parseBlocks( compile( '@include wp-admin-theme-colors(".stats-main");' ) );

		expect( blocks.length ).toBeGreaterThan( 0 );
		blocks.forEach( ( { selector } ) => {
			expect( selector ).toMatch( /^body\S* \S/ );
		} );
	} );

	it( 'emits nothing at all until a caller applies it', () => {
		// The reason this file is not imported by calypso-color-schemes.scss: every other consumer of
		// the package would otherwise carry rules for surfaces only Stats renders.
		expect( sass.compileString( buildAdminThemeColors( schemes() ) ).css.trim() ).toBe( '' );
	} );

	it( 'is not imported by the package stylesheet every other app loads', () => {
		const shared = fs.readFileSync(
			path.join( __dirname, '..', 'src', 'calypso-color-schemes.scss' ),
			'utf8'
		);

		expect( shared ).not.toMatch( /^@import\s+["']__wp-base-styles\/admin-theme-colors/m );
	} );
} );
