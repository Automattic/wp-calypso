/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );

const terserDefaults = {
	ecma: 5,
	safari10: true,
	mangle: true,
};

/**
 * Returns an array containing a Terser plugin object to be used in Webpack minification.
 *
 * @see https://github.com/webpack-contrib/terser-webpack-plugin for complete descriptions of options.
 *
 * @param {Object}           _               Options
 * @param {(Boolean|string)} _.cache         Enable file caching
 * @param {(Boolean|number)} _.parallel      Use multi-process parallel running to improve the build speed
 * @param {Boolean}          _.sourceMap     Use source maps to map error message locations to modules
 * @param {Object}           _.terserOptions Terser minify options
 * @returns {Object[]}                       Terser plugin object to be used in Webpack minification.
 */
module.exports = ( { cache = true, parallel = false, sourceMap = false, terserOptions = {} } ) => [
	new TerserPlugin( {
		cache,
		parallel,
		sourceMap,
		terserOptions: Object.assign( {}, terserDefaults, terserOptions ),
	} ),
];
