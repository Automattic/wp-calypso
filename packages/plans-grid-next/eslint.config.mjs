import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{ languageOptions: { globals: browserGlobals } },
	{
		files: [ '**/docs/example.jsx', '**/*.md.js', '**/*.md.jsx' ],
		// These are consumed only by Calypso's webpack build, it is ok to import other Calypso components
		rules: {
			'no-restricted-imports': 'off',
		},
	},
];

export default config;
