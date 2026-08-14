/**
 * @jest-environment node
 */
import fs from 'fs';
const {
	getAdminSchemes,
	buildAdminThemeColors,
	CALYPSO_STATS_ROOTS,
	CALYPSO_PORTAL_ROOTS,
	// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require( '../bin/prepare-sass-assets' );

// Built here rather than read from src/__wp-base-styles, which is generated and git-ignored:
// that file survives branch switches, so asserting against it fails for reasons unrelated to
// the code under test.
const schemes = (): Record< string, string > =>
	getAdminSchemes(
		fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
	);

const generated = (): string => buildAdminThemeColors( schemes() );

interface Block {
	selectors: string[];
	declarations: Record< string, string >;
}

// Splits on the commas that separate selectors, leaving the ones inside `:is(…)` alone.
const splitSelectors = ( group: string ): string[] =>
	group
		.split( /,(?![^(]*\))/ )
		.map( ( selector ) => selector.replace( /\s+/g, ' ' ).trim() )
		.filter( Boolean );

// A line-based parser rather than a brace-based one: `#{color.adjust(…)}` puts a closing brace in
// the middle of a declaration, so splitting on braces would cut the block in the wrong place.
// Selector lines are unindented and a group can span several of them; declarations are tab-indented
// and hold at most one `:` that separates property from value.
const parseBlocks = ( css: string ): Block[] => {
	const blocks: Block[] = [];
	let pendingSelectors: string[] = [];
	let current: Block | null = null;

	for ( const line of css.split( '\n' ) ) {
		if ( ! line.trim() || line.startsWith( '//' ) || line.startsWith( '@' ) ) {
			continue;
		}

		if ( current ) {
			if ( line === '}' ) {
				blocks.push( current );
				current = null;
			} else {
				const declaration = line.trim().replace( /;$/, '' );
				const separator = declaration.indexOf( ':' );
				current.declarations[ declaration.slice( 0, separator ).trim() ] = declaration
					.slice( separator + 1 )
					.trim();
			}
			continue;
		}

		pendingSelectors.push( line.endsWith( '{' ) ? line.slice( 0, -1 ) : line );

		if ( line.endsWith( '{' ) ) {
			current = { selectors: splitSelectors( pendingSelectors.join( ' ' ) ), declarations: {} };
			pendingSelectors = [];
		}
	}

	return blocks;
};

const allSelectors = (): string[] => parseBlocks( generated() ).flatMap( ( b ) => b.selectors );

const targetsCalypsoPortal = ( selector: string ) =>
	CALYPSO_PORTAL_ROOTS.some( ( root: string ) => selector.includes( root ) );

describe( 'admin theme colour declarations', () => {
	it( 'emits one block per scheme, and drops none of them', () => {
		const names = Object.keys( schemes() );
		const blocks = parseBlocks( generated() );

		expect( names.length ).toBeGreaterThan( 0 );
		expect( blocks ).toHaveLength( names.length );
	} );

	it( 'sets the admin theme token — not some other property — to each scheme’s own colour', () => {
		// Guards the whole point of the package: a block that named a different property, or reused
		// one scheme’s hex for every block, would still satisfy every selector-shaped assertion.
		const blocks = parseBlocks( generated() );

		Object.entries( schemes() ).forEach( ( [ name, hex ] ) => {
			const block = blocks.find( ( b ) =>
				b.selectors.every( ( selector ) => selector.startsWith( `body.is-${ name }` ) )
			);

			expect( block ).toBeDefined();
			expect( block?.declarations ).toEqual( {
				'--wp-admin-theme-color': hex,
				'--wp-admin-theme-color-darker-10': `#{color.adjust(${ hex }, $lightness: -5%)}`,
				'--wp-admin-theme-color-darker-20': `#{color.adjust(${ hex }, $lightness: -10%)}`,
			} );
		} );
	} );

	it( 'covers fresh, the wp-admin default that upstream omits from the mixin', () => {
		expect( schemes().fresh ).toBe( '#3858e9' );
		expect( generated() ).toContain( 'body.is-fresh ' );
	} );

	it( 'darkens rather than lightens, so hover and focus stay darker than resting', () => {
		parseBlocks( generated() ).forEach( ( { declarations } ) => {
			expect( declarations[ '--wp-admin-theme-color-darker-10' ] ).toContain( '-5%' );
			expect( declarations[ '--wp-admin-theme-color-darker-20' ] ).toContain( '-10%' );
		} );
	} );
} );

describe( 'admin theme colour scoping', () => {
	it( 'anchors every rule to a root that includes the mixin', () => {
		const selectors = allSelectors();

		expect( selectors.length ).toBeGreaterThan( 0 );
		selectors.forEach( ( selector ) => {
			const onStatsRoot = CALYPSO_STATS_ROOTS.some( ( root: string ) => selector.includes( root ) );
			expect( onStatsRoot || targetsCalypsoPortal( selector ) ).toBe( true );
		} );
	} );

	it( 'qualifies the generic Calypso portal roots with the Stats section', () => {
		// `.popover` and friends are used throughout Calypso. Without `.is-section-stats` these
		// rules would recolour every popover and modal in the product.
		const portalSelectors = allSelectors().filter( targetsCalypsoPortal );

		expect( portalSelectors.length ).toBeGreaterThan( 0 );
		portalSelectors.forEach( ( selector ) => {
			expect( selector ).toContain( '.is-section-stats' );
		} );
	} );

	it( 'leaves the Odyssey roots alone', () => {
		// Odyssey hands the property back to wp-admin from its own styles rather than taking a value
		// from here, so a rule in this package naming one of its mounts would fight that.
		allSelectors().forEach( ( selector ) => {
			expect( selector ).not.toContain( '.stats-widget-content' );
			expect( selector ).not.toContain( '.jp-stats-dashboard' );
			expect( selector ).not.toContain( '.jp-stats-widget' );
			expect( selector ).not.toMatch( /\.color-scheme\.is-/ );
		} );
	} );

	it( 'never sets the token on <body> itself, which would reach the whole of Calypso', () => {
		// A body-anchored selector must have a descendant part, so the declaration lands inside
		// Stats rather than on the document.
		const selectors = allSelectors();

		expect( selectors.length ).toBeGreaterThan( 0 );
		selectors.forEach( ( selector ) => {
			expect( selector ).toMatch( /^body\S* \S/ );
		} );
	} );

	it( 'states a colour on every rule rather than inheriting one', () => {
		// `inherit` is Odyssey's mechanism, for taking back what wp-admin already set. In Calypso the
		// scheme blocks set this property on <body> to the decorative accent, so `inherit` here would
		// silently reinstate the colour this package exists to replace.
		parseBlocks( generated() ).forEach( ( { declarations } ) => {
			Object.values( declarations ).forEach( ( value ) => {
				expect( value ).not.toBe( 'inherit' );
			} );
		} );
	} );
} );
