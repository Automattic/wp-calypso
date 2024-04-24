const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = storybookDefaultConfig( {
	staticDirs: [ '../static' ],
	webpackAliases: {
		[ 'wpcom-proxy-request' ]: require.resolve( '../src/__mocks__/wpcom-proxy-request.js' ),
	},
} );
