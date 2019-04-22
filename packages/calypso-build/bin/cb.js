#!/usr/bin/env node

/**
 * External dependencies
 */
const path = require( 'path' );

if ( ! process.argv.some( arg => arg.startsWith( '--config' ) ) ) {
	process.argv.push( '--config', path.join( __dirname, '..', 'webpack.config.js' ) );
}

require( 'webpack-cli' );
