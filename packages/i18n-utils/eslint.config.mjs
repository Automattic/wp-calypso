import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso,
	{
		files: [ '**/*.md.js' ],
		rules: {
			'import/no-extraneous-dependencies': 'off',
		},
	},
];

export default config;
