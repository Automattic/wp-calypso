const storybookDefaultConfig = require( '@automattic/calypso-storybook' );

module.exports = {
	...storybookDefaultConfig( {
		staticDirs: [ '../static' ],
		webpackAliases: {
			// We are mocking wpcom-proxy-request because calls to wpcomRequest() (eg. inside the
			// usePlans hook) are not working with MSW. This is a temporary workaround until we can
			// figure out why.
			[ 'wpcom-proxy-request' ]: require.resolve( '../src/__mocks__/wpcom-proxy-request.js' ),
		},
	} ),
};
