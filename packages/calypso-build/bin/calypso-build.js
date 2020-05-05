#!/usr/bin/env node

/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

if ( ! process.argv.some( ( arg ) => arg.startsWith( '--config' ) ) ) {
	let webpackConfig = path.join( process.cwd(), 'webpack.config.js' );
	if ( ! fs.existsSync( webpackConfig ) ) {
		webpackConfig = path.join( __dirname, '..', 'webpack.config.js' ); // Default to this package's Webpack config
	}

	process.argv.push( '--config', webpackConfig );
}

require( 'webpack-cli' );
