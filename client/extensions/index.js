/**
 * External dependencies
 */

const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules
const path = require( 'path' );

const extensions = fs
	.readdirSync( __dirname )
	.filter( ( node ) => fs.statSync( path.join( __dirname, node ) ).isDirectory() );

module.exports = extensions;
