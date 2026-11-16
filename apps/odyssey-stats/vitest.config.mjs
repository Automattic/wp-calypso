import path from 'node:path';
import { calypsoTestConfig } from '../../build-tools/vite/test.mjs';

export default calypsoTestConfig( {
	root: import.meta.dirname,
	resolve: {
		// As in `webpack.config.js`.
		alias: [
			{
				find: /^odyssey-wp-components-style$/,
				replacement: path.join(
					import.meta.dirname,
					'../../node_modules/@wordpress/components/build-style/style.css'
				),
			},
		],
	},
	test: {
		environment: 'jsdom',
		include: [ '**/test/*.{js,jsx,ts,tsx}' ],
		setupFiles: [ '../../test/dashboard/vitest-setup.ts' ],
		// The shared config sets its own worker count, so these run after the other apps.
		sequence: { groupOrder: 1 },
	},
} );
