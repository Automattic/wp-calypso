import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		...nodeConfig,
		rules: {
			...nodeConfig.rules,

			// We have functions called `test` that are not related to jest at all
			'jest/expect-expect': 'off',
			'jest/no-disabled-tests': 'off',
			'jest/no-export': 'off',
			'jest/no-test-callback': 'off',
		},
	},
] );
