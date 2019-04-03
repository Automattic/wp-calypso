/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );

/**
 * Returns an array containing a Terser plugin object to be used in Webpack minification.
 *
 * @see https://github.com/webpack-contrib/terser-webpack-plugin for complete descriptions of options.
 *
 * @param {Object} options Options passed to the terser plugin
 * @returns {Object[]}     Terser plugin object to be used in Webpack minification.
 */
module.exports = options => [ new TerserPlugin( options ) ];
