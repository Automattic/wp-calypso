/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

/**
 * Internal variables
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * Return a webpack config object
 *
 * Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 *
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 *
 * @param   {object}  env                           environment options
 * @param   {object}  argv                          options map
 * @param   {object}  argv.entry                    Entry point(s)
 * @param   {string}  argv.'output-path'            Output path
 * @param   {string}  argv.'output-filename'        Output filename pattern
 * @param   {string}  argv.'output-library-target'  Output library target
 * @returns {object}                                webpack config
 */
function getWebpackConfig(
	env = {},
	{
		entry = {
			'default.editor': path.join( __dirname, 'src', 'default', 'editor' ),
			'default.view': path.join( __dirname, 'src', 'default', 'view' ),
			'wpcom.editor': path.join( __dirname, 'src', 'wpcom', 'editor' ),
			'calypso.editor': path.join( __dirname, 'src', 'calypso', 'editor' ),
			'calypso.tinymce': path.join( __dirname, 'src', 'calypso', 'tinymce' ),
		},
		'output-path': outputPath = path.join( __dirname, 'dist' ),
		'output-filename': outputFilename = isDevelopment ? '[name].js' : '[name].min.js',
	}
) {
	const webpackConfig = getBaseWebpackConfig( env, {
		entry,
		'output-filename': outputFilename,
		'output-path': outputPath,
	} );

	return {
		...webpackConfig,
		devtool: isDevelopment ? 'inline-cheap-source-map' : false,
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) => plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new DependencyExtractionWebpackPlugin( {
				requestToExternal( request ) {
					if ( request === 'tinymce/tinymce' ) {
						return 'tinymce';
					}
				},
				requestToHandle( request ) {
					if ( request === 'tinymce/tinymce' ) {
						return 'wp-tinymce';
					}
				},
			} ),
		],
	};
}

module.exports = getWebpackConfig;
