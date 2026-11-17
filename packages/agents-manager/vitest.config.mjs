import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		// Tests compare page URLs against an origin without a port.
		environmentOptions: { jsdom: { url: 'http://localhost/' } },
		include: [ 'src/**/__tests__/*.{js,jsx,ts,tsx}' ],
		setupFiles: [ '../../test/packages/match-media.mjs', './vitest-setup.js' ],
		server: {
			deps: {
				// Some @wordpress ES modules import a directory (`fast-deep-equal/es6`) or JSON without
				// an import attribute, which Node can't load; Vite resolves both when it transforms them.
				inline: [ /\/node_modules\/@wordpress\// ],
			},
		},
	},
} );
