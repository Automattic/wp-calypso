const path = require( 'path' );
const babelConfig = require( '@automattic/calypso-babel-config' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = babelConfig( {
	isBrowser: process.env.BROWSERSLIST_ENV !== 'server',
	outputPOT: path.join( __dirname, 'build/i18n-calypso/' ),
	importSource: '@emotion/react',
} );

// Only apply wp-components import rewriting during webpack builds, not in tests.
if ( process.env.NODE_ENV !== 'test' ) {
	config.plugins = config.plugins || [];
	config.plugins.push( path.join( __dirname, 'client/babel-plugin-wp-components-imports.js' ) );
}

module.exports = config;
