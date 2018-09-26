/** @format */
/**
 * External dependencies
 */
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;

exports.config = ( { argv: { outputDir }, getBaseConfig, calypsoRoot } ) => {
	const baseConfig = getBaseConfig( { cssFilename: 'build.css' } );

	const pageMeta = {
		nodePlatform: process.platform,
		nodeVersion: process.version,
		gitDescribe: spawnSync( 'git', [ 'describe', '--always', '--dirty', '--long' ], {
			encoding: 'utf8',
		} ).stdout.replace( '\n', '' ),
	};

	return {
		...baseConfig,
		entry: path.join( calypsoRoot, 'client', 'notifications', 'src', 'standalone' ),
		node: {
			fs: 'empty',
		},
		output: {
			path: outputDir,
			filename: 'build.min.js',
		},
		plugins: [
			...baseConfig.plugins,
			new HtmlWebpackPlugin( {
				filename: path.join( outputDir, 'index.html' ),
				template: path.join( calypsoRoot, 'client', 'notifications', 'src', 'index.ejs' ),
				title: 'Notifications',
				hash: true,
				inject: false,
				isRTL: false,
				...pageMeta,
			} ),
			new HtmlWebpackPlugin( {
				filename: path.join( outputDir, 'rtl.html' ),
				template: path.join( calypsoRoot, 'client', 'notifications', 'src', 'index.ejs' ),
				title: 'Notifications',
				hash: true,
				inject: false,
				isRTL: true,
				...pageMeta,
			} ),
			new HtmlWebpackPlugin( {
				filename: path.join( outputDir, 'cache-buster.txt' ),
				templateContent: () => pageMeta.gitDescribe,
				inject: false,
			} ),
		],
	};
};
