/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CALYPSO_STATS_ROOTS, CALYPSO_PORTAL_ROOTS } = require( '../bin/prepare-sass-assets' );

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

const read = ( file: string ) => fs.readFileSync( path.join( REPO_ROOT, file ), 'utf8' );

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
