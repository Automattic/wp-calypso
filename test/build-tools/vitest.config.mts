import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig( {
	cacheDir: path.resolve( import.meta.dirname, '../../.cache/vitest' ),
	test: {
		root: path.resolve( import.meta.dirname, '../../build-tools' ),
		include: [ '**/test/*.[jt]s?(x)' ],
		exclude: [ '**/fixtures/**', '**/node_modules/**' ],
		globals: true,
		pool: 'forks',
	},
} );
