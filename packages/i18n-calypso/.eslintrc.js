module.exports = {
	overrides: [
		{
			files: [ '*.md.jsx', '*.md.js' ],
			rules: {
				'wpcalypso/i18n-named-placeholders': 'off',
				'wpcalypso/i18n-no-variables': 'off',
				'no-restricted-imports': 'off',
			},
		},
	],
};
