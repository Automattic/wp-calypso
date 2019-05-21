/**
 * External Dependencies
 */
const ClosurePlugin = require( 'closure-webpack-plugin' );
const browserslist = require( 'browserslist' );
const caniuse = require( 'caniuse-api' );

const supportedBrowsers = browserslist( null, { env: process.env.BROWSERSLIST_ENV || 'defaults' } );

/**
 * Auxiliary method to help in picking an ECMAScript version based on a list
 * of supported browser versions.
 *
 * @param {Array<String>} browsers The list of supported browsers.
 *
 * @returns {Number} The maximum supported ECMAScript version.
 */
function chooseEcmaVersion( browsers ) {
	if ( ! caniuse.isSupported( 'arrow-functions', browsers ) ) {
		return 'ECMASCRIPT5';
	}
	if ( ! caniuse.isSupported( 'es6-class', browsers ) ) {
		return 'ECMASCRIPT5';
	}

	return 'ECMASCRIPT_2015';
}

/**
 * Returns an array containing a Terser plugin object to be used in Webpack minification.
 *
 * @see https://github.com/webpack-contrib/terser-webpack-plugin for complete descriptions of options.
 *
 * @param {Object} options Options passed to the terser plugin
 * @returns {Object[]}     Terser plugin object to be used in Webpack minification.
 */
module.exports = options => {
	return [
		new ClosurePlugin(
			{
				mode: 'AGGRESSIVE_BUNDLE',
			},
			{
				languageOut: chooseEcmaVersion( supportedBrowsers ),
			}
		),
	];
};
