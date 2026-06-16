const WebpackRTLPlugin = require( '@automattic/webpack-rtl-plugin' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const MiniCSSRuntimeFullHashPlugin = require( './mini-css-runtime-full-hash' );
const MiniCSSWithRTLPlugin = require( './mini-css-with-rtl' );

/**
 * Return a webpack loader object containing our styling (Sass -> CSS) stack.
 * @param  {Object}    _                              Options
 * @param  {string[]}  _.includePaths                 Sass files lookup paths
 * @param  {Object}    _.postCssOptions               PostCSS options
 * @returns {Object}                                  webpack loader object
 */
module.exports.loader = ( { includePaths, postCssOptions } ) => ( {
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
				api: 'modern',
				sassOptions: ( loaderContext ) => ( {
					loadPaths: includePaths,
					quietDeps: true,
					silenceDeprecations: [ 'mixed-decls' ],
					...( loaderContext.resourcePath.endsWith( '.css' ) ? { syntax: 'scss' } : {} ),
				} ),
			},
		},
	],
} );

/**
 * Return an array of styling relevant webpack plugin objects.
 * @param  {Object}   _                Options
 * @param  {string}   _.chunkFilename  filename pattern to use for CSS files
 * @param  {string}   _.filename       filename pattern to use for CSS chunk files
 * @param  {boolean}  _.rtl            Whether to generate RTL CSS assets
 * @returns {Object[]}                 styling relevant webpack plugin objects
 */
module.exports.plugins = ( { chunkFilename, filename, rtl = true } ) =>
	[
		new MiniCssExtractPlugin( {
			chunkFilename,
			filename,
			ignoreOrder: true, // suppress conflicting order warnings from mini-css-extract-plugin
			attributes: {
				'data-webpack': true,
			},
			experimentalUseImportModule: true,
		} ),
		new MiniCSSRuntimeFullHashPlugin(),
		rtl && new MiniCSSWithRTLPlugin(),
		rtl && new WebpackRTLPlugin(),
	].filter( Boolean );
