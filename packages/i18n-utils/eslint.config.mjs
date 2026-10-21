import calypso from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{
		files: [ '**/*.md/*.js' ],
		rules: {
			'import/no-extraneous-dependencies': 'off',
		},
	},
] );
