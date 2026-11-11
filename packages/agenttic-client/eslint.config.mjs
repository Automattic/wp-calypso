import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		rules: {
			'@wordpress/i18n-text-domain': [ 'error', { allowedTextDomain: 'a8c-agenttic' } ],
			// Console usage in these packages is being addressed separately.
			'no-console': 'off',
		},
	},
] );
