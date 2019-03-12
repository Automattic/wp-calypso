/**
 * Return a webpack loader object containing our jsx (jsx -> js) stack.
 *
 * @param  {Object}    _                    Options
 * @param  {integer}   _.workerCount        Number of workers that are being used by the thread-loader
 * @param  {string}    _.configFile         Babel loader config file
 * @param  {string}    _.cacheDirectory     Babel loader cache directory
 * @param  {string}    _.cacheIdentifier    Babel loader cache identifier
 *
 *
 * @return {Object}   webpack loader object
 */
module.exports.loader = ( {
	workerCount,
	configFile,
	cacheDirectory,
	cacheIdentifier,
	exclude,
} ) => {
	if ( ! workerCount ) {
		workerCount = 1;
	}
	if ( ! configFile ) {
		console.log( 'Please specifiy the bable.js configFile' ); // eslint-disable-line no-console
		return {};
	}

	if ( ! cacheDirectory ) {
		console.log( 'No cacheDirectory is set, set one to speed up babel.' ); // eslint-disable-line no-console
	}

	if ( ! cacheIdentifier ) {
		console.log( 'Please specifiy the bable cacheIdentifier' ); // eslint-disable-line no-console
		return {};
	}

	if ( ! exclude ) {
		exclude = /node_modules\//;
	}

	return {
		test: /\.jsx?$/,
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
				},
			},
		],
	};
};
