#!/usr/bin/env node

/** @format */
const path = require( 'path' );
const webpack = require( 'webpack' );

const [ /* node */, /* this-script */, givenEditorScript, givenOutputDir ] = process.argv;

const __rootDir = path.resolve( __dirname, '../../' );
const CopyWebpackPlugin = require( path.resolve( __rootDir, 'server/bundler/copy-webpack-plugin' ) );
const editorScript = path.resolve( __rootDir, givenEditorScript );
const sourceDir = path.dirname( editorScript );
const name = path.basename( sourceDir.replace( /\/$/, '' ) );
const outputDir = givenOutputDir ? givenOutputDir : path.join( sourceDir, 'build' );

const baseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const config = {
	...baseConfig,
	...{
		context: __rootDir,
		mode: 'production',
		entry: {
			[ `${ name }-editor-script` ]: editorScript,
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
			filename: `${ name }-editor.js`,
			libraryTarget: 'window',
			library: `plugins-${ name }-editor`,
		},
		plugins: [
			...baseConfig.plugins.filter( plugin => ! ( plugin instanceof CopyWebpackPlugin ) ),
		]
	},
};

const compiler = webpack( config );

compiler.run( ( error, stats ) => console.log( stats.toString() ) );
