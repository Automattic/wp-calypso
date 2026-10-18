import calypso from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
	...calypso,
	{
		files: [ '**/*.md.jsx', '**/*.md.js' ],
		rules: {
			'wpcalypso/i18n-named-placeholders': 'off',
			'wpcalypso/i18n-no-variables': 'off',
			'no-restricted-imports': 'off',
		},
	},
];

export default config;
