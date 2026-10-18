import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso,
	{
		rules: {
			'@automattic/json/valid-values-name-scope': 'off',
		},
	},
];

export default config;
