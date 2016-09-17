/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const plugins = fs.readdirSync( path.join( __dirname, 'plugins' ) )
	.filter( node => fs.statSync( path.join( __dirname, 'plugins', node ) ).isDirectory() );

module.exports = plugins;
