import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: { environment: 'jsdom', setupFiles: [ './vitest-setup.js' ] },
} );
