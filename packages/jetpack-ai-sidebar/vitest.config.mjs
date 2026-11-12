import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		include: [ 'src/**/*.test.{js,ts,tsx}' ],
		setupFiles: [ '../../test/packages/match-media.mjs', './vitest-setup.js' ],
	},
} );
