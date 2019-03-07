/**
 * External dependencies
 */
const MiniCssExtractPluginWithRTL = require( 'mini-css-extract-plugin-with-rtl' );

module.exports = ( { preserveCssCustomProperties, includePaths, prelude } ) => ( {
	test: /\.(sc|sa|c)ss$/,
		use: [
		MiniCssExtractPluginWithRTL.loader,
		{
			loader: 'css-loader',
			options: {
				importLoaders: 2,
			},
		},
		{
			loader: 'postcss-loader',
			options: {
				config: {
					ctx: {
						preserveCssCustomProperties,
					},
				},
			},
		},
		{
			loader: 'sass-loader',
			options: {
				includePaths,
				data: prelude
			},
		},
	],
} );
