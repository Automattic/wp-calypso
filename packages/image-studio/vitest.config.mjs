import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

const mock = ( file ) => fileURLToPath( new URL( `./src/__mocks__/${ file }`, import.meta.url ) );

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
		],
	},
	test: {
		environment: 'jsdom',
		include: [ 'src/**/*.test.{js,ts,tsx}' ],
		setupFiles: [ './src/__mocks__/setup.ts' ],
	},
} );
