/**
 * External dependencies
 */
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

function getWebpackConfig(
	env = {},
	{
		entry = path.join( __dirname, 'src', 'standalone' ),
		'output-path': outputPath = path.join( __dirname, 'dist' ),
		'output-filename': outputFilename = 'build.min.js',
	}
) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': outputFilename,
		'output-path': outputPath,
	} );

	return {
		...webpackConfig,
		externals: {
			...webpackConfig.externals,
			react: 'React',
		},
	};
}

module.exports = getWebpackConfig;
