/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
const {
	CALYPSO_STATS_ROOTS,
	CALYPSO_PORTAL_ROOTS,
	getAdminSchemes,
	// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require( '../bin/prepare-sass-assets' );

// This package sets `--wp-admin-theme-color`; `stats-interactive-colors` reads it. Nothing in the
// CSS makes them agree — a root that includes the mixin but is absent from this package's lists
// re-points its accents at a token nothing set there, and silently inherits whatever <body> has.
// That is how the Store Stats list view shipped with the mixin and no token. These tests are the
// only thing standing between the two lists and the next such drift.
const REPO_ROOT = path.join( __dirname, '..', '..', '..' );

// Calypso only. Odyssey applies the same mixin at its own roots, but wp-admin already publishes the
// token there, so those roots have nothing to line up with in this package.
const CONSUMERS = [
	'client/my-sites/stats/components/stats-main/style.scss',
	'client/my-sites/store/style.scss',
];

// `body > .color-scheme` in stats-main is Odyssey's portal wrapper. Calypso's <body> carries the
// scheme class rather than a child, so the selector never matches here and needs no token.
const ODYSSEY_ONLY_ROOTS = [ '.color-scheme' ];

// Odyssey's mirror of the scheme list. It hands `--wp-admin-theme-color` back to wp-admin for the
// schemes wp-admin ships; this package supplies a value for the same set in Calypso. The two are
// written independently and neither imports the other.
const ODYSSEY_HANDBACK = 'apps/odyssey-stats/src/styles/_admin-theme-handback.scss';

const read = ( file: string ) => fs.readFileSync( path.join( REPO_ROOT, file ), 'utf8' );

const odysseySchemes = (): string[] => {
	const list = read( ODYSSEY_HANDBACK ).match( /\$wp-admin-schemes:\s*([^;]*);/ );

	if ( ! list ) {
		throw new Error( `Could not find $wp-admin-schemes in ${ ODYSSEY_HANDBACK }.` );
	}

	return [ ...list[ 1 ].matchAll( /"([a-z-]+)"/g ) ].map( ( m ) => m[ 1 ] ).sort();
};

const calypsoSchemes = (): string[] =>
	Object.keys(
		getAdminSchemes(
			fs.readFileSync( require.resolve( '@wordpress/base-styles/_mixins.scss' ), 'utf8' )
		)
	).sort();

/**
 * The innermost selector group enclosing each `@include stats-interactive-colors`, as written.
 * A brace-depth walk rather than a regex: the group can span several lines and sit at any nesting.
 */
const mixinSelectorGroups = ( scss: string ): string[] => {
	const groups: string[] = [];
	const stack: string[] = [];
	let pending: string[] = [];

	for ( const rawLine of scss.split( '\n' ) ) {
		const line = rawLine.trim();

		if ( ! line || line.startsWith( '//' ) ) {
			continue;
		}
		if ( line.includes( '@include stats-interactive-colors' ) ) {
			groups.push( stack[ stack.length - 1 ] ?? '' );
			continue;
		}
		if ( line === '}' ) {
			stack.pop();
			continue;
		}
		if ( line.endsWith( '{' ) ) {
			pending.push( line.slice( 0, -1 ) );
			stack.push( pending.join( ' ' ).replace( /\s+/g, ' ' ).trim() );
			pending = [];
			continue;
		}
		if ( ! line.startsWith( '@' ) && ! line.endsWith( ';' ) ) {
			pending.push( line );
		}
	}

	return groups;
};

const splitSelectors = ( group: string ): string[] =>
	group
		.split( /,(?![^(]*\))/ )
		.map( ( selector ) => selector.replace( /\s+/g, ' ' ).trim() )
		.filter( Boolean );

/**
 * The roots a selector actually names. An `:is(…)` group is expanded into its members rather than
 * treated as one string: `:is(.popover, .ReactModalPortal)` has to be checked member by member, or
 * dropping one from this package's lists still leaves the others to vouch for the whole selector.
 */
const rootsIn = ( selector: string ): string[] => {
	const group = selector.match( /:is\(([^)]*)\)/ );

	return group
		? group[ 1 ]
				.split( ',' )
				.map( ( root ) => root.trim() )
				.filter( Boolean )
		: [ selector ];
};

describe( 'admin theme colour consumers', () => {
	it( 'finds the mixin applied in every file this test claims to cover', () => {
		CONSUMERS.forEach( ( file ) => {
			expect( mixinSelectorGroups( read( file ) ).length ).toBeGreaterThan( 0 );
		} );
	} );

	it( 'sets the token on every Calypso root that includes the mixin', () => {
		const known = [ ...CALYPSO_STATS_ROOTS, ...CALYPSO_PORTAL_ROOTS, ...ODYSSEY_ONLY_ROOTS ];

		CONSUMERS.flatMap( ( file ) =>
			mixinSelectorGroups( read( file ) )
				.flatMap( splitSelectors )
				.flatMap( rootsIn )
				.map( ( root ) => [ file, root ] )
		).forEach( ( [ file, root ] ) => {
			const covered = known.some( ( name: string ) => root.includes( name ) );

			// Failure means `${ file }` applies the mixin at a root this package never sets
			// `--wp-admin-theme-color` on. Add it to CALYPSO_STATS_ROOTS or CALYPSO_PORTAL_ROOTS in
			// bin/prepare-sass-assets.js, or narrow the selector.
			expect( { file, root, covered } ).toEqual( { file, root, covered: true } );
		} );
	} );

	it( 'covers exactly the schemes Odyssey hands back to wp-admin', () => {
		// The two environments have to agree on which schemes get core's interactive colour. Odyssey
		// takes it from wp-admin, Calypso from this package, and the lists are maintained separately —
		// so a scheme in one and not the other means Stats looks different in wp-admin than it does
		// on WordPress.com. That is exactly how `fresh`, the default scheme, came to be missing here
		// while Odyssey had it all along.
		expect( calypsoSchemes() ).toEqual( odysseySchemes() );
	} );

	it( 'applies the mixin at every root this package sets the token on', () => {
		const applied = CONSUMERS.flatMap( ( file ) => mixinSelectorGroups( read( file ) ) ).join(
			' '
		);

		[ ...CALYPSO_STATS_ROOTS, ...CALYPSO_PORTAL_ROOTS ].forEach( ( root: string ) => {
			// The reverse drift: a token set on a root nothing includes the mixin at is dead weight,
			// and usually means a rename landed here but not in the SCSS.
			expect( { root, applied: applied.includes( root ) } ).toEqual( { root, applied: true } );
		} );
	} );
} );
