/**
 * External dependencies
 */
const FilterWarningsPlugin = require( 'webpack-filter-warnings-plugin' );
const MiniCssExtractPluginWithRTL = require( 'mini-css-extract-plugin-with-rtl' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const path = require( 'path' );

/**
 * Return a webpack loader object containing our styling (Sass -> CSS) stack.
 *
 * @param  {Object}    _                              Options
 * @param  {boolean}   _.preserveCssCustomProperties  whether Custom Properties and properties using them should be preserved in their original form
 * @param  {string[]}  _.includePaths                 Sass files lookup paths
 * @param  {string}    _.prelude                      String to prepend to each Sass file
 *
 * @return {Object}                                   webpack loader object
 */
module.exports.loader = ( { preserveCssCustomProperties, includePaths, prelude } ) => ( {
	test: /\.(sc|sa|c)ss$/,
	use: [
		MiniCssExtractPluginWithRTL.loader,
		{
			loader: require.resolve( 'css-loader' ),
			options: {
				importLoaders: 2,
			},
		},
		{
			loader: require.resolve( 'postcss-loader' ),
			options: {
				config: {
					ctx: {
						preserveCssCustomProperties,
					},
					path: path.join( __dirname, '..' ),
				},
			},
		},
		{
			loader: require.resolve( 'sass-loader' ),
			options: {
				includePaths,
				data: prelude,
			},
		},
	],
} );

/**
 * Return an array of styling relevant webpack plugin objects.
 *
 * @param  {Object}   _              Options
 * @param  {String}   _.cssFilename  filename pattern to use for CSS files
 * @param  {Boolean}  _.minify       whether to minify CSS
 *
 * @return {Object[]}                styling relevant webpack plugin objects
 */
module.exports.plugins = ( { cssFilename, minify } ) => [
	new MiniCssExtractPluginWithRTL( {
		filename: cssFilename,
		rtlEnabled: true,
	} ),
	new FilterWarningsPlugin( {
		// suppress conflicting order warnings from mini-css-extract-plugin.
		// see https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250
		exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
	} ),
	new WebpackRTLPlugin( {
		minify,
	} ),
];
