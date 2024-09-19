const path = require( 'path' );
const babelConfig = require( '@automattic/calypso-babel-config' );

// We implicitly use browserslist configuration in package.json for build targets.

module.exports = babelConfig( {
	isBrowser: process.env.BROWSERSLIST_ENV !== 'server',
	outputPOT: path.join( __dirname, 'build/i18n-calypso/' ),
	importSource: '@emotion/react',
} );
