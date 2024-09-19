const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const webpack = require( 'webpack' );

/* Arguments to this function replicate webpack's so this config can be used on the command line,
 * with individual options overridden by command line args.
 * @see {@link https://webpack.js.org/configuration/configuration-types/#exporting-a-function}
 * @see {@link https://webpack.js.org/api/cli/}
 * @param   {Object}  env                           environment options
 * @param   {string}  env.source                    plugin slugs, comma separated list
 * @param   {Object}  argv                          options map
 * @param   {string}  argv.entry                    entry path
 * @returns {Object}                                webpack config
 */
function getWebpackConfig( env = { source: '' }, argv = {} ) {
	const outputPath = path.join( __dirname, 'dist' );

	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		mode: 'production',
		entry: {
			'block-editor': path.join( __dirname, 'src', 'index.ts' ),
		},
		output: {
			...webpackConfig.output,
			path: outputPath,
			// Unfortunately, we can't set the name to `[name].js` for the
			// dev env because at runtime we'd also need a way to detect
			// if the env was dev or prod, as the file is enqueued in WP
			// and there's no way to do that now. The simpler alternative
			// is to generate a .min.js for dev and prod, even though the
			// file is not really minified in the dev env.
			filename: '[name].min.js', // dynamic filename
			library: 'verbumBlockEditor',
		},
		externals: {
			'@wordpress/i18n': [ 'wp', 'i18n' ],
		},
		plugins: [
			...webpackConfig.plugins,
			new webpack.DefinePlugin( {
				'process.env.IS_GUTENBERG_PLUGIN': true,
			} ),
		],
	};
}

module.exports = getWebpackConfig;
