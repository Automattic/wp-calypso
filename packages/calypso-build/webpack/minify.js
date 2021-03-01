/**
 * External Dependencies
 */
const TerserPlugin = require( 'terser-webpack-plugin' );
const browserslist = require( 'browserslist' );
const babelPlugins = require( '@babel/compat-data/plugins' );
const semver = require( 'semver' );

const supportedBrowsers = browserslist( null, { env: process.env.BROWSERSLIST_ENV || 'defaults' } );

// The list of browsers to check, that are supported by babel compat-data.
// Babel compat-data also includes non-browser environments, which we want to exclude.
const browsersToCheck = [ 'chrome', 'opera', 'edge', 'firefox', 'safari', 'ios', 'ie' ];

// Check if a feature is supported by all browsers in the provided browserslist.
function isFeatureSupported( feature, browsers ) {
	const featureMinVersions = babelPlugins[ feature ];

	for ( const featureBrowser of browsersToCheck ) {
		let featureRange;

		if ( ! featureMinVersions[ featureBrowser ] ) {
			// No browser entry, which means no version of the browser supports the feature.
			featureRange = '>=999999';
		} else {
			featureRange = `>=${ featureMinVersions[ featureBrowser ] }`;
		}

		const listRanges = browsers.filter( ( b ) => b.startsWith( featureBrowser ) );

		for ( let listRange of listRanges ) {
			// Remove browser name from range.
			listRange = listRange.split( ' ' )[ 1 ];
			// Massage range syntax into something `semver` accepts.
			listRange = listRange.replace( '-', ' - ' );

			if ( ! semver.subset( listRange, featureRange ) ) {
				return false;
			}
		}
	}
	return true;
}

/**
 * Auxiliary method to help in picking an ECMAScript version based on a list
 * of supported browser versions.
 *
 * If Terser ever supports `browserslist`, this method will no longer be needed
 * and the world will be a better place.
 *
 * @param {Array<string>} browsers The list of supported browsers.
 *
 * @returns {number} The maximum supported ECMAScript version.
 */
function chooseTerserEcmaVersion( browsers ) {
	// Test for ES2015 features. If missing fall back to ES5.
	if (
		! isFeatureSupported( 'transform-arrow-functions', browsers ) ||
		! isFeatureSupported( 'transform-classes', browsers )
	) {
		return 5;
	}

	// Test for ES2016 features. If missing fall back to ES2015.
	if ( ! isFeatureSupported( 'transform-exponentiation-operator', browsers ) ) {
		return 2015;
	}

	// Test for ES2017 features. If missing fall back to ES2016.
	if ( ! isFeatureSupported( 'transform-async-to-generator', browsers ) ) {
		return 2016;
	}

	// Test for ES2018 features. If missing fall back to ES2017.
	if (
		! isFeatureSupported( 'proposal-object-rest-spread', browsers ) ||
		! isFeatureSupported( 'transform-named-capturing-groups-regex', browsers ) ||
		! isFeatureSupported( 'proposal-unicode-property-regex', browsers )
	) {
		return 2017;
	}

	// Test for ES2019 features. If missing fall back to ES2018.
	if ( ! isFeatureSupported( 'proposal-optional-catch-binding', browsers ) ) {
		return 2018;
	}

	// Test for ES2020 features. If missing fall back to ES2019.
	if (
		! isFeatureSupported( 'proposal-optional-chaining', browsers ) ||
		! isFeatureSupported( 'proposal-nullish-coalescing-operator', browsers )
	) {
		return 2019;
	}

	// Looks like everything we tested for is supported, so default to latest
	// available ES spec that Terser can handle.
	return 2020;
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
