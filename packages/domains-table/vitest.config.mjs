import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	test: { include: [ '**/__tests__/**/*.{js,jsx,ts,tsx}' ], setupFiles: [ './vitest.setup.js' ] },
} );
