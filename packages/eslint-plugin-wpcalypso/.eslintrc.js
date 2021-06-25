module.exports = {
	rules: {
		'import/no-nodejs-modules': 0,
	},
	overrides: [
		{
			files: [ '*.md.js', '*.md.jsx' ],
			rules: {
				'wpcalypso/i18n-mismatched-placeholders': 'off',
				'wpcalypso/i18n-named-placeholders': 'off',
				'wpcalypso/i18n-no-collapsible-whitespace': 'off',
				'wpcalypso/i18n-no-placeholders-only': 'off',
				'wpcalypso/i18n-no-this-translate': 'off',
				'wpcalypso/i18n-no-variables': 'off',
				'wpcalypso/redux-no-bound-selectors': 'off',
				'wpcalypso/jsx-gridicon-size': 'off',
				'no-restricted-imports': 'off',
				'no-restricted-modules': 'off',
			},
		},
	],
};
