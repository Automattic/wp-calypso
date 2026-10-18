import parent from '../../eslint.config.mjs';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...parent,
	{
		rules: {
			'wpcalypso/no-unsafe-wp-apis': 'off',
			'wpcalypso/i18n-ellipsis': 'off',
		},
	},
];

export default config;
