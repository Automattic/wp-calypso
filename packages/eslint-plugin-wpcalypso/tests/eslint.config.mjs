import parent from '../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...parent,
	{
		rules: {
			'max-len': 0,
		},
	},
];

export default config;
