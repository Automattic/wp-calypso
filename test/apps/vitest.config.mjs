import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		root: path.resolve( import.meta.dirname, '../..' ),
		projects: [ 'apps/*/vitest.config.mjs' ],
	},
} );
