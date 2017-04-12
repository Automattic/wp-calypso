/* eslint-disable import/no-commonjs */

/**
 * External dependencies
 */
const debugFactory = require( 'debug' );
const webpackResolver = require( 'eslint-import-resolver-webpack' );

/**
 * Internal dependencies
 */
const webpackResolveConfig = require( './webpack.config.resolve' );

/**
 * Module variables
 */
const log = debugFactory( 'eslint-plugin-import:resolver:wp-calypso-resolver' );

const clientResolverConfig = {
	config: {
		resolve: webpackResolveConfig.client,
	},
};

const serverResolverConfig = {
	config: {
		resolve: webpackResolveConfig.server,
	},
};

exports.interfaceVersion = 2;

exports.resolve = function( source, file ) {
	log( 'Resolving', source, 'from:', file );
	// If the file is from...
	//   - a 'test' folder:     assume valid resolution.
	//   - the 'client' folder: use client Webpack config for resolution.
	//   - the 'server' folder: use server Webpack config for resolution.
	//   - none of above:       assume valid resolution.
	if ( file.indexOf( '/test/' ) > 0 ) {
		log( 'Test file found, skipping resolution checks' );
		return { found: true, path: null };
	} else if ( file.indexOf( '/client/' ) > 0 ) {
		log( 'Resolving with webpack.config.js' );
		return webpackResolver.resolve( source, file, clientResolverConfig );
	} else if ( file.indexOf( '/server/' ) > 0 ) {
		log( 'Resolving with webpack.node.js' );
		return webpackResolver.resolve( source, file, serverResolverConfig );
	}

	log( 'Modules outside of client and server directories are not parsed, skipping' );
	return { found: true, path: null };
};
