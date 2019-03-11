/**
 * Return a webpack loader object containing our jsx (jsx -> js) stack.
 *
 * @param  {Object}    _                    Options
 * @param  {boolean}   _.workerCount        Number of workers that are being used by the thread-loader
 * @param  {string[]}  _.configFile         Babel loader config file
 * @param  {string}    _.cacheDirectory     Babel loader cacheDirectory
 *
 * @return {Object}   webpack loader object
 */
module.exports.loader = ( { workerCount, configFile, cacheDirectory } ) => ( {
    test: /\.jsx?$/,
    exclude: /node_modules\//,
    use: [
        {
            loader: require.resolve( 'thread-loader' ) ,
            options: {
                workers: workerCount,
            },
        },
        {
            loader: require.resolve(  'babel-loader' ),
            options: {
                configFile: configFile,
                babelrc: false,
                cacheDirectory: cacheDirectory,
                cacheIdentifier,
            },
        },
    ],
} );