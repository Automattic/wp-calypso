#!/usr/bin/env node

/** @format */
const path = require( 'path' );
const webpack = require( 'webpack' );

const __rootDir = path.resolve( __dirname, '../../' );
const CopyWebpackPlugin = require( path.resolve( __rootDir, 'server/bundler/copy-webpack-plugin' ) );
const entryPath = path.resolve( __rootDir, process.argv[ 2 ] );
const sourceDir = path.dirname( entryPath );
const outputDir = process.argv[ 3 ] ? process.argv[ 3 ] : path.join( sourceDir, 'build' );

const baseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const config = {
	...baseConfig,
	...{
		context: __rootDir,
		mode: 'production',
		entry: {
			'editor-js': entryPath,
		},
		externals: {
			...baseConfig.externals,
			wp: 'wp',
		},
		optimization: {
			splitChunks: false,
		},
		output: {
			path: outputDir,
			filename: `[name].js`,
			libraryTarget: 'window',
			library: `plugins-[name]`,
		},
		plugins: [
			...baseConfig.plugins.filter( plugin => ! ( plugin instanceof CopyWebpackPlugin ) ),
		]
	},
};

const compiler = webpack( config );

compiler.run( ( error, stats ) => console.log( stats.toString() ) );
