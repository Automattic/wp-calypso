import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		files: [ '**/docs/example.jsx', '**/*.md/*.js', '**/*.md/*.jsx' ],
		// These are consumed only by Calypso's webpack build, it is ok to import other Calypso components
		rules: {
			'no-restricted-imports': 'off',
		},
	},
] );
