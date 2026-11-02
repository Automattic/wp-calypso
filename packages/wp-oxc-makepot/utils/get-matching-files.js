const { globSync } = require( 'glob' );

// glob (13 and 14) doesn't apply a relative `**/` ignore pattern to files in a
// sibling of cwd, such as `../../client/test/x.js` run from `apps/<app>`.
// Rooting the pattern makes it match at any depth, as glob 7 did.
const toIgnorePattern = ( pattern ) => ( pattern.startsWith( '**/' ) ? '/' + pattern : pattern );

module.exports = ( patterns, ignore = [] ) =>
	Array.from(
		new Set(
			patterns.flatMap( ( pattern ) =>
				globSync( pattern, { nodir: true, absolute: true, ignore: ignore.map( toIgnorePattern ) } )
			)
		)
	).sort();
