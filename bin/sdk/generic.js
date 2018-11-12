/** @format */
/**
 * External dependencies
 */
const path = require( 'path' );
const webpack = require( 'webpack' );

exports.config = ( { argv: { entryPoint, outputName }, getBaseConfig } ) => {
	const baseConfig = getBaseConfig();

	return {
		...baseConfig,
		entry: entryPoint,
		output: {
			path: path.resolve( path.dirname( outputName ) ),
			filename: path.basename( outputName ),
		},
		plugins: [
			...baseConfig.plugins,
			new webpack.optimize.LimitChunkCountPlugin( {
				maxChunks: 1,
			} ),
		],
	};
};
