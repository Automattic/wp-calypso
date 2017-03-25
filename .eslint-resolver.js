/**
 * External dependencies
 */
const assign = require ( 'lodash/assign' );
const debugFactory = require( 'debug' );
const nodeResolver = require( 'eslint-import-resolver-node' );
const path = require( 'path' );
const webpackResolver = require( 'eslint-import-resolver-webpack' );

/**
 * Internal dependencies
 */
const webpackResolveConfig = require( './webpack.config.resolve' );

/**
 * Module variables
 */
const log = debugFactory('eslint-plugin-import:resolver:wp-calypso-resolver');

const nodeResolverConfig = {
	extensions: [
		'.js',
		'.jsx',
	],
	moduleDirectory: [
		'node_modules',
		'server'
	],
	paths: [
		path.join( __dirname, 'test' ),
		path.join( __dirname, 'server' ),
		path.join( __dirname, 'client' ),
	]
};

const webpackResolverConfig = {
	config: {
		resolve: webpackResolveConfig,
	},
};

exports.interfaceVersion = 2

exports.resolve = function (source, file, config) {
	log('Resolving', source, 'from:', file);
	// If the file is from the client folder, use Webpack for resolution.
	// Otherwise, use Node's resolver.
	if (file.indexOf('/client/') > 0) {
		log('Client file detected, resolving with Webpack');
		return webpackResolver.resolve( source, file, webpackResolverConfig );
	} else {
		log('Resolving with Node resolver');
		return nodeResolver.resolve( source, file, nodeResolverConfig );
	}
}
