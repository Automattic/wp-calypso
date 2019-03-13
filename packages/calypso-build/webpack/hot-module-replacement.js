/**
 * External dependencies
 */
const webpack = require( 'webpack' );

/**
 * Return an array of hot module reloading relevant webpack plugin object
 *
 * @param  {Boolean}   isDeveloment  whether the code is bundled is in development mode
 *
 * @return {Object[]}  hot module reloading webpack plugin object
 */
module.exports.plugins = isDeveloment => {
	return isDeveloment ? new webpack.HotModuleReplacementPlugin() : null;
};

/**
 * Return an array of hot module reloading entryBuild
 *
 * @param  {Boolean}   isDeveloment  whether the code is bundled is in development mode
 * @param  {Array}     entries  the code entry points.
 *
 * @return {Object[]}  hot module reloading webpack plugin object
 */
module.exports.entryBuild = ( isDeveloment, entries ) => {
	return isDeveloment ? entries.unshift( 'webpack-hot-middleware/client' ) : entries;
};
