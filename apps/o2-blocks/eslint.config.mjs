import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso,
	{ languageOptions: { globals: browserGlobals } },
	{
		rules: {
			'react/react-in-jsx-scope': 0,
			'wpcalypso/jsx-classname-namespace': 'off',
		},
	},
];

export default config;
