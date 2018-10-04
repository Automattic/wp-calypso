/** @format */

const rimraf = require( 'rimraf' );
const process = require( 'process' );

console.log( `cleaning ${ process.cwd() }` );
rimraf( 'dist/**/*', err => {
	console.error( err );
} );
