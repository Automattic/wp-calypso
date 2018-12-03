/** @format */

const glob = require( 'glob' );
const rimraf = require( 'rimraf' );
const path = require( 'path' );

glob( 'packages/*/package.json', ( err, matches ) => {
	if ( err ) {
		console.error( err );
		return;
	}
	matches.forEach( match => {
		const dir = path.dirname( match );
		console.log( `Cleaning ${ dir }` );
		rimraf( path.join( dir, 'dist/**/*' ), rmErr => {
			if ( rmErr ) {
				console.error( rmErr );
			}
		} );
	} );
} );
