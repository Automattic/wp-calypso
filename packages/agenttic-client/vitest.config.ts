import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		include: [ 'src/**/*.test.{ts,tsx}' ],
		css: {
			modules: {
				classNameStrategy: 'non-scoped',
			},
		},
	},
} );
