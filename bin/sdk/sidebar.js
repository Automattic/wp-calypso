/**
 * External dependencies
 */
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require( 'path' );

exports.config = ( { getBaseConfig, calypsoRoot } ) => {
	const baseConfig = getBaseConfig( { cssFilename: 'sidebar-app.css' } );
	const inputDir = path.join( calypsoRoot, 'client', 'sidebar' );
	const outputDir = path.join( calypsoRoot, 'public' );

	return {
		...baseConfig,
		entry: inputDir,
		node: {
			fs: 'empty',
		},
		output: {
			path: outputDir,
			filename: 'sidebar-app.min.js',
		},
		plugins: [
			...baseConfig.plugins,
			new HtmlWebpackPlugin( {
				filename: path.join( outputDir, 'sidebar-app.html' ),
				template: path.join( inputDir, 'index.ejs' ),
				hash: true,
				inject: false,
			} ),
		],
	};
};
