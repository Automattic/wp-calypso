import { fileURLToPath } from 'node:url';
import storybookDefaultConfig from '@automattic/calypso-storybook';

export default storybookDefaultConfig( {
	staticDirs: [ '../static' ],
	webpackAliases: {
		// We are mocking wpcom-proxy-request because calls to wpcomRequest() (eg. inside the
		// usePlans hook) are not working with MSW. This is a temporary workaround until we can
		// figure out why.
		[ 'wpcom-proxy-request' ]: fileURLToPath(
			import.meta.resolve( '../src/__mocks__/wpcom-proxy-request.js' )
		),
	},
} );
