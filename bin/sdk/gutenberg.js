/** @format */

/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const path = require( 'path' );
const webpack = require( 'webpack' );
const { isEmpty, negate, pickBy } = require( 'lodash' );

const __rootDir = path.resolve( __dirname, '../../' );
const CopyWebpackPlugin = require( path.resolve( __rootDir, 'server/bundler/copy-webpack-plugin' ) );
const baseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

exports.compile = args => {

	const options = {
		outputDir: path.join( path.dirname( args.editorScript ), 'build' ),
		...args
	};

	const name = path.basename( path.dirname( options.editorScript, ).replace( /\/$/, '' ) );

	const config = {
		...baseConfig,
		...{
			context: __rootDir,
			mode: options.mode,
			entry: pickBy( {
				[ `${ name }-editor-script.js` ]: options.editorScript,
				[ `${ name }-view-script.js` ]: options.viewScript,
			}, negate( isEmpty ) ),
			externals: {
				...baseConfig.externals,
				wp: 'wp',
			},
			optimization: {
				splitChunks: false,
			},
			output: {
				path: options.outputDir,
				filename: '[name]',
				libraryTarget: 'window',
			},
			plugins: [
				...baseConfig.plugins.filter( plugin => ! ( plugin instanceof CopyWebpackPlugin ) ),
			]
		},
	};

	const compiler = webpack( config );

	compiler.run( ( error, stats ) => {
		if ( error ) {
			console.error( error );
			console.log( chalk.red( 'Failed to build Gutenberg extension' ) );
			process.exit( 1 );
		}

		console.log( stats.toString() );

		if ( stats.hasErrors() ) {
			console.log( chalk.red( 'Finished building Gutenberg extension but with errors.' ) );
		} else if ( stats.hasWarnings() ) {
			console.log( chalk.yellow( 'Successfully built Gutenberg extension but with warnings.' ) );
		} else {
			console.log( chalk.green( 'Successfully built Gutenberg extension' ) );
		}
	} );
};
