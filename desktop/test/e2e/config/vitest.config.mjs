import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		root: path.resolve( import.meta.dirname, '../../..' ),
		include: [ 'test/e2e/specs/*.js' ],
		globals: true,
		pool: 'forks',
		// Launching the app and loading WordPress.com can take a while on CI.
		testTimeout: 60000,
		hookTimeout: 60000,
		reporters: [ 'verbose' ],
	},
} );
