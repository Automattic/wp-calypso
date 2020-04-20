/**
 * Return a Webpack loader configuration object for files / images.
 *
 * @param  {object} options File loader options
 * @returns {object}         Webpack loader object
 */
module.exports.loader = ( options ) => ( {
	test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
	use: [
		{
			loader: require.resolve( 'file-loader' ),
			options: {
				name: '[name]-[hash].[ext]',
				outputPath: 'images/',
				...options,
			},
		},
	],
} );
