const path = require( 'path' );

/**
 * Return a Webpack loader configuration object for images.
 *
 * @param {object} options Options object
 * @param {string} options.outputPath Path inside `options.path` to save the images, defaults to 'images'
 */
module.exports.loader = ( { outputPath = 'images' } = {} ) => ( {
	test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
	type: 'asset/resource',
	generator: {
		filename: path.join( outputPath, '[name]-[contenthash][ext]' ),
	},
} );
