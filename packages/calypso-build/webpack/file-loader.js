/**
 * Return a Webpack loader configuration object for files / images.
 *
 * @return {Object} Webpack loader object
 */
module.exports.loader = () => ( {
	test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
	use: [
		{
			loader: 'file-loader',
			options: {
				name: '[name]-[hash].[ext]',
				outputPath: 'images/',
			},
		},
	],
} );
