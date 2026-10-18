import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		files: [ '**/__tests__/**' ],
		rules: {
			'jest/no-mocks-import': 'off',
		},
	},
];

export default config;
