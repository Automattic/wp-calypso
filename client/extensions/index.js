/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const extensions = fs.readdirSync( __dirname )
	.filter( node => fs.statSync( path.join( __dirname, node ) ).isDirectory() );

module.exports = extensions;
