/**
 * External Dependencies
 */
const { ESBuildMinifyPlugin } = require( 'esbuild-loader' );
const browserslist = require( 'browserslist' );

// The list of browsers to check supported by esbuild

const getTarget = () => {
	// esbuild only supports these targets (https://esbuild.github.io/api/#target)
	const supportedBrowsersByEsbuild = [ 'chrome', 'firefox', 'safari', 'edge' ];

	// Get the version of supported targets based on browserslist environment
	const browsers = browserslist( null, {
		env: process.env.BROWSERSLIST_ENV || 'defaults',
	} ).filter( ( browser ) => supportedBrowsersByEsbuild.includes( browser.split( ' ' )[ 0 ] ) );

	// Pick the lowest version for each supported browser
	const minVersions = browsers.reduce( ( list, browser ) => {
		const [ name, version ] = browser.split( ' ' );
		list[ name ] = Math.min( name in list ? list[ name ] : Infinity, Number( version ) );
		return list;
	}, {} );

	// Concatenate them in the format expected by esbuild
	const esbuildTarget = Object.entries( minVersions )
		.map( ( [ k, v ] ) => `${ k }${ v }` )
		.join( ',' );

	return esbuildTarget;
};

/**
 * Returns an instance of MinifyPlugin from `esbuild-loader`
 *
 * @see https://github.com/privatenumber/esbuild-loader
 *
 * @returns {object[]}     ESBuildMinifyPlugin plugin object to be used in Webpack minification.
 */
module.exports = () => {
	return [
		new ESBuildMinifyPlugin( {
			target: getTarget(),
		} ),
	];
};
