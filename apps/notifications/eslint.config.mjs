import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		rules: {
			// This app imports `combineReducers` from redux directly, so the root
			// `no-restricted-imports` rule (which forbids it) is turned off here.
			'no-restricted-imports': 'off',
		},
	},
];

export default config;
