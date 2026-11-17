import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

const mock = ( file ) => `${ import.meta.dirname }/src/__mocks__/${ file }`;

export default mergeConfig( base, {
	resolve: {
		alias: [
			{
				find: /^@automattic\/calypso-analytics$/,
				replacement: mock( '@automattic/calypso-analytics.ts' ),
			},
			{ find: /^@wordpress\/data$/, replacement: mock( '@wordpress/data.ts' ) },
			{ find: /^@wordpress\/core-data$/, replacement: mock( '@wordpress/core-data.ts' ) },
			{ find: /^@wordpress\/blocks$/, replacement: mock( '@wordpress/blocks.ts' ) },
			{ find: /^@wordpress\/block-editor$/, replacement: mock( '@wordpress/block-editor.ts' ) },
			{ find: /^@wordpress\/media-utils$/, replacement: mock( '@wordpress/media-utils.ts' ) },
			{ find: /^.*\.(webp|png|jpe?g|gif|svg)$/, replacement: mock( 'fileMock.ts' ) },
			// agenttic-client has no `calypso:src` export, and CI doesn't build it before the tests.
			// Vitest resolves a mocked module too, so point it at the source.
			{
				find: /^@automattic\/agenttic-client$/,
				replacement: `${ import.meta.dirname }/../agenttic-client/src/index.ts`,
			},
		],
	},
	test: {
		environment: 'jsdom',
		include: [ 'src/**/*.test.{js,ts,tsx}' ],
		setupFiles: [ './src/__mocks__/setup.ts' ],
	},
} );
