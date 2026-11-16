import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: {
		environment: 'jsdom',
		// Node then loads the same browser build of `@emotion/react` that `@emotion/styled` requires, as
		// Jest's jsdom environment did. Otherwise each gets its own theme context, and styles see no theme.
		execArgv: [ '--conditions=browser' ],
		setupFiles: [ './vitest-setup.js' ],
	},
} );
