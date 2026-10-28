import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		rules: {
			'react/react-in-jsx-scope': 0,
			'wpcalypso/jsx-classname-namespace': 'off',
		},
	},
] );
