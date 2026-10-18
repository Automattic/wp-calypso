import parent from '../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...parent,
	{
		rules: {
			'import/no-nodejs-modules': 'off',
		},
	},
];

export default config;
