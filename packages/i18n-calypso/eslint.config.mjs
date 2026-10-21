import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		files: [ '**/*.md/*.jsx', '**/*.md/*.js' ],
		rules: {
			'wpcalypso/i18n-named-placeholders': 'off',
			'wpcalypso/i18n-no-variables': 'off',
			'no-restricted-imports': 'off',
		},
	},
] );
