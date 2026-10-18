import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		rules: {
			'react/react-in-jsx-scope': 0,
		},
	},
];

export default config;
