/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );
const browserslist = require( 'browserslist' );
const caniuse = require( 'caniuse-api' );

const supportedBrowsers = browserslist( null, { env: process.env.BROWSERSLIST_ENV || 'defaults' } );

/**
 * Auxiliary method to help in picking an ECMAScript version based on a list
 * of supported browser versions.
 *
 * @param {Array<string>} browsers The list of supported browsers.
 *
 * @returns {number} The maximum supported ECMAScript version.
 */
function chooseTerserEcmaVersion( browsers ) {
	if ( ! caniuse.isSupported( 'arrow-functions', browsers ) ) {
		return 5;
	}
	if ( ! caniuse.isSupported( 'es6-class', browsers ) ) {
		return 5;
	}

	return 6;
}

/**
 * Returns an array containing a Terser plugin object to be used in Webpack minification.
 *
 * @see https://github.com/webpack-contrib/terser-webpack-plugin for complete descriptions of options.
 *
 * @param {object} options Options passed to the terser plugin
 * @returns {object[]}     Terser plugin object to be used in Webpack minification.
 */
module.exports = ( options ) => {
	let terserOptions = options.terserOptions || {};
	terserOptions = {
		ecma: chooseTerserEcmaVersion( supportedBrowsers ),
		ie8: false,
		safari10: supportedBrowsers.some(
			( browser ) => browser.includes( 'safari 10' ) || browser.includes( 'ios_saf 10' )
		),
		...terserOptions,
	};

	return [ new TerserPlugin( { ...options, terserOptions } ) ];
};
