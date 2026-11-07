// PROTOTYPE (DOTMSD-1675): the Dashboard tests on the shared Vite base + test overlay. Throwaway.
import path from 'node:path';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

process.env.TZ = 'UTC';

export default calypsoTestConfig( {
	root: path.resolve( import.meta.dirname, '../../client' ),
	test: {
		include: [ 'dashboard/**/test/*.test.{js,jsx,ts,tsx}' ],
		setupFiles: [ path.join( import.meta.dirname, 'vitest-setup.ts' ) ],
	},
} );
