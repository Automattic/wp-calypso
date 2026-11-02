const path = require( 'path' );
const { globSync } = require( 'glob' );

// glob (13 and 14) doesn't apply relative ignore patterns to files in a sibling
// of cwd, such as `../../client/test/x.js` run from `apps/<app>`. Globbing from
// the folder a leading `../` points to keeps those files under cwd.
module.exports = ( patterns, ignore ) =>
	Array.from(
		new Set(
			patterns.flatMap( ( pattern ) => {
				const [ , up, rest ] = pattern.match( /^((?:\.\.\/)*)(.*)$/s );
				return globSync( rest, { cwd: path.resolve( up ), nodir: true, absolute: true, ignore } );
			} )
		)
	).sort();
