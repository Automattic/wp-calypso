/** @format */
/**
 * External dependencies
 */
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );
const spawnSync = require( 'child_process' ).spawnSync;

exports.config = ( { argv: { outputDir }, getBaseConfig, calypsoRoot } ) => {
	const baseConfig = getBaseConfig();

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
				filename: path.join( outputDir, 'root.html' ),
				gitDescribe: spawnSync( 'git', [ 'describe', '--always', '--dirty', '--long' ], {
					encoding: 'utf8',
				} ).stdout.replace( '\n', '' ),
				hash: true,
				nodePlatform: process.platform,
				nodeVersion: process.version,
				template: path.join( calypsoRoot, 'client', 'notifications', 'src', 'index.ejs' ),
			} ),
		],
	};
};
