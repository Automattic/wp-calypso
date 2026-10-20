import { defineConfig } from 'eslint/config';
import parent from '../../eslint.config.mjs';

export default defineConfig( [
	...parent,
	{
		rules: {
			'wpcalypso/no-unsafe-wp-apis': 'off',
			'wpcalypso/i18n-ellipsis': 'off',
		},
	},
] );
