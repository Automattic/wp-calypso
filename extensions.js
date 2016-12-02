/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const EXTENSIONS_DIR = 'extensions';

const extensions = fs.readdirSync( path.join( __dirname, EXTENSIONS_DIR ) )
	.filter( node => fs.statSync( path.join( __dirname, EXTENSIONS_DIR, node ) ).isDirectory() );

module.exports = extensions;
