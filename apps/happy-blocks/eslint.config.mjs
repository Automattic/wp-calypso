import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		rules: {
			'@automattic/json/valid-values-name-scope': 'off',
		},
	},
] );
