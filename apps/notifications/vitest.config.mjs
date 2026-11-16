import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

export default calypsoTestConfig( {
	root: import.meta.dirname,
	test: {
		environment: 'jsdom',
		include: [ '**/test/*.{js,jsx,ts,tsx}' ],
		setupFiles: [ '../../test/dashboard/vitest-setup.ts' ],
		// The shared config sets its own worker count, so these run after the other apps.
		sequence: { groupOrder: 1 },
	},
} );
