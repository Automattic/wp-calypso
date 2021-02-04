/**
 * Return a Webpack loader configuration object for images.
 */
module.exports.loader = () => ( {
	test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
	type: 'asset/resource',
	generator: {
		filename: 'images/[name]-[contenthash][ext]',
	},
} );
