#!/usr/bin/env node

if ( ! process.argv.some( arg => arg.startsWith( '--config' ) ) ) {
	process.argv.push( '--config', require.resolve( '@automattic/calypso-build/webpack.config.js' ) );
}

require( 'webpack-cli' );
