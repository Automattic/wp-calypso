import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		rules: {
			'import/no-nodejs-modules': 0,
		},
	},
];

export default config;
