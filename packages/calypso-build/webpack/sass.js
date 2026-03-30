const WebpackRTLPlugin = require( '@automattic/webpack-rtl-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const MiniCSSWithRTLPlugin = require( './mini-css-with-rtl' );

/**
 * Return a webpack loader object containing our styling (Sass -> CSS) stack.
 * @param  {Object}    _                              Options
 * @param  {string[]}  _.includePaths                 Sass files lookup paths
 * @param  {string}    _.prelude                      String to prepend to each Sass file
 * @param  {Object}    _.postCssOptions               PostCSS options
 * @returns {Object}                                  webpack loader object
 */
module.exports.loader = ( { includePaths, prelude, postCssOptions } ) => ( {
	test: /\.(sc|sa|c)ss$/,
	use: [
		MiniCssExtractPlugin.loader,
		{
			loader: require.resolve( 'css-loader' ),
			options: {
				importLoaders: 2,
				// We do not want css-loader to resolve absolute paths. We
				// typically use `/` to indicate the start of the base URL,
				// but starting with css-loader v4, it started trying to handle
				// absolute paths itself.
				url: {
					filter: ( path ) => ! path.startsWith( '/' ),
				},
			},
		},
		{
			loader: require.resolve( 'postcss-loader' ),
			options: {
				postcssOptions: postCssOptions || {},
			},
		},
		{
			loader: require.resolve( 'sass-loader' ),
			options: {
				additionalData: prelude,
				sassOptions: {
					includePaths,
					quietDeps: true,
				},
				// The warnRuleAsWarning can be removed once sass-loader is updated to v14. It defaults to true in that version.
				// @see https://github.com/webpack-contrib/sass-loader/tree/v14.0.0?tab=readme-ov-file#warnruleaswarning
				warnRuleAsWarning: true,
			},
		},
	],
} );

/**
 * Return an array of styling relevant webpack plugin objects.
 * @param  {Object}   _                Options
 * @param  {string}   _.chunkFilename  filename pattern to use for CSS files
 * @param  {string}   _.filename       filename pattern to use for CSS chunk files
 * @returns {Object[]}                 styling relevant webpack plugin objects
 */
module.exports.plugins = ( { chunkFilename, filename } ) => [
	new MiniCssExtractPlugin( {
		chunkFilename,
		filename,
		ignoreOrder: true, // suppress conflicting order warnings from mini-css-extract-plugin
		attributes: {
			'data-webpack': true,
		},
	} ),
	new MiniCSSWithRTLPlugin(),
	new WebpackRTLPlugin(),
];
