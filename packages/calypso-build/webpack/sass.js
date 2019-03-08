/**
 * External dependencies
 */
const MiniCssExtractPluginWithRTL = require( 'mini-css-extract-plugin-with-rtl' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );

/**
 * Return a webpack loader object containing our styling (Sass -> CSS) stack.
 *
 * @param {boolean}   preserveCssCustomProperties  whether Custom Properties and properties using them should be preserved in their original form
 * @param {string[]}  includePaths                 Sass files lookup paths
 * @param {string}    prelude                      String to prepend to each Sass file
 *
 * @return {Object}                                webpack loader object
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
 * @param {String}   cssFilename  filename pattern to use for CSS files
 * @param {Boolean}  minify       whether to minify CSS
 *
 * @return {Object[]}             styling relevant webpack plugin objects
 */
module.exports.plugins = ( { cssFilename, minify } ) => [
	new MiniCssExtractPluginWithRTL( {
		filename: cssFilename,
		rtlEnabled: true,
	} ),
	new WebpackRTLPlugin( {
		minify,
	} ),
];
