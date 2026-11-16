import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

const mock = ( name, file ) => ( {
	find: new RegExp( `^${ name }$` ),
	replacement: new URL( `./src/test/__mocks__/${ file }`, import.meta.url ).pathname,
} );

export default mergeConfig( base, {
	resolve: {
		// These packages' import chains crash at module-evaluation time in tests.
		alias: [
			mock( '@automattic/onboarding', 'automattic-onboarding.js' ),
			mock( '@automattic/data-stores', 'automattic-data-stores.js' ),
			mock( '@automattic/zendesk-client', 'automattic-zendesk-client.js' ),
			mock( '@automattic/calypso-products', 'automattic-calypso-products.js' ),
			mock( '@automattic/components', 'automattic-components.js' ),
		],
	},
	test: {
		environment: 'jsdom',
		setupFiles: [ '../../test/packages/match-media.mjs', './vitest-setup.ts' ],
	},
} );
