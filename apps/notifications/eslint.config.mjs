import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		rules: {
			// This app imports `combineReducers` from redux directly, so the root
			// `no-restricted-imports` rule (which forbids it) is turned off here.
			'no-restricted-imports': 'off',
		},
	},
] );
