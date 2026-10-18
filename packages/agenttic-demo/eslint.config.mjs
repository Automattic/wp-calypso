import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso( import.meta.dirname ),
	{
		rules: {
			// Console usage in these packages is being addressed separately.
			'no-console': 'off',
		},
	},
];

export default config;
