/** @format */

/**
 * External dependencies
 */
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const chalk = require( 'chalk' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;
const webpack = require( 'webpack' );

const __rootDir = path.resolve( __dirname, '../../' );
const CopyWebpackPlugin = require( path.resolve(
	__rootDir,
	'server/bundler/copy-webpack-plugin'
) );
const getBaseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

exports.compile = options => {
	const baseConfig = getBaseConfig();
	console.log( options.mode );

	const config = {
		...baseConfig,
		...{
			context: __rootDir,
			mode: options.mode,
			devtool: 'source-map',
			entry: path.join( __rootDir, 'client', 'notifications', 'src', 'standalone' ),
			node: {
				fs: 'empty',
			},
			optimization: {
				splitChunks: false,
			},
			output: {
				path: options.outputDir,
				filename: 'build.min.js',
			},
			plugins: [
				...baseConfig.plugins.filter( plugin => ! ( plugin instanceof CopyWebpackPlugin ) ),
				new HtmlWebpackPlugin( {
					filename: path.join( options.outputDir, 'root.html' ),
					gitDescribe: spawnSync( 'git', [ 'describe', '--always', '--dirty', '--long' ], { encoding: 'utf8' } ).stdout.replace( '\n', '' ),
					hash: true,
					nodePlatform: process.platform,
					nodeVersion: process.version,
					template: path.join( __rootDir, 'client', 'notifications', 'src', 'index.ejs' )
				} ),
			],
		},
	};

	const compiler = webpack( config );

	compiler.run( ( error, stats ) => {
		if ( error ) {
			console.error( error );
			console.log( chalk.red( 'Failed to build notifications' ) );
			process.exit( 1 );
		}

		console.log( stats.toString() );

		if ( stats.hasErrors() ) {
			console.log( chalk.red( 'Finished building notifications but with errors.' ) );
		} else if ( stats.hasWarnings() ) {
			console.log( chalk.yellow( 'Successfully built notifications but with warnings.' ) );
		} else {
			console.log( chalk.green( 'Successfully built notifications' ) );
		}
	} );
};
