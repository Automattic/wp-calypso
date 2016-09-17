/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

const plugins = fs.readdirSync( path.join( __dirname, 'plugins' ) );

module.exports = plugins;
