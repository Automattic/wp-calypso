import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		languageOptions: { globals: browserGlobals },
		rules: {
			'jsdoc/no-undefined-types': [
				'error',
				{
					definedTypes: [ 'WPCOM' ],
				},
			],
		},
	},
] );
