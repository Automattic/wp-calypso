import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
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
];

export default config;
