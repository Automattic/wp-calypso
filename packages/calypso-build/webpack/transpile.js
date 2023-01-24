/**
 * Return a Webpack loader configuration object containing for JavaScript transpilation.
 *
 * @param {Object} _                   Options
 * @param {number} _.workerCount       Number of workers that are being used by the thread-loader
 * @param {string} _.configFile        Babel config file
 * @param {string} _.cacheDirectory    Babel cache directory
 * @param {string} _.cacheIdentifier   Babel cache identifier
 * @param {boolean} _.cacheCompression Whether to apply gzip compression to the cached files (defauls to true)
 * @param {RegExp|Function} _.exclude  Directories to exclude when looking for files to transpile
 * @param {RegExp|Function} _.include  Directories to inclued when looking for files to transpile
 * @param {string[]} _.presets         Babel presets
 * @returns {Object} Webpack loader object
 */
module.exports.loader = ( {
	workerCount,
	configFile,
	cacheDirectory,
	cacheIdentifier,
	cacheCompression = true,
	exclude,
	include,
	presets,
} ) => ( {
	test: /\.[jt]sx?$/,
	include,
	exclude,
	use: [
		{
			loader: require.resolve( 'thread-loader' ),
			options: {
				workers: workerCount,
			},
		},
		{
			loader: require.resolve( 'babel-loader' ),
			options: {
				configFile,
				babelrc: false,
				cacheDirectory,
				cacheIdentifier,
				cacheCompression,
				presets,
			},
		},
	],
} );
