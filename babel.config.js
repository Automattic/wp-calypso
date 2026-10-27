const babelConfig = require( '@automattic/calypso-babel-config' );

// We implicitly use browserslist configuration in package.json for build targets.

module.exports = babelConfig( {
	importSource: '@emotion/react',
} );
