const path = require( 'path' );

/**
 * Return a Webpack loader configuration object for files / images.
 *
 * @param {Object} options Rule.generator options
 * @param options.outputPath Where to output the asset
 * @param options.name Name of the asset
 * @param options.publicPath Path used to generate the URL for the asset
 * @param options.emitFile Whether to write the assets to the filesystem (defaults to true)
 * @returns {Object} Webpack loader object
 */
module.exports.loader = ( {
	outputPath = 'images/',
	name = '[name]-[hash][ext]',
	publicPath,
	emitFile = true,
} = {} ) => ( {
	test: /\.(?:gif|jpg|jpeg|png|svg)$/i,
	type: 'asset/resource',
	generator: {
		filename: path.join( outputPath, name ),
		publicPath,
		emit: emitFile,
	},
} );
