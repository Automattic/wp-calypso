import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: { environment: 'jsdom', include: [ 'tests/**/*.test.{ts,tsx}' ] },
} );
