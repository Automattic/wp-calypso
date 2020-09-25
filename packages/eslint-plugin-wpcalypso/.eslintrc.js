module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'import/no-nodejs-modules': 0,
	},
	overrides: [
		{
			files: [ '*.md.js', '*.md.jsx' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
				'wpcalypso/i18n-mismatched-placeholders': 'off',
				'wpcalypso/i18n-named-placeholders': 'off',
				'wpcalypso/i18n-no-collapsible-whitespace': 'off',
				'wpcalypso/i18n-no-placeholders-only': 'off',
				'wpcalypso/i18n-no-this-translate': 'off',
				'wpcalypso/i18n-no-variables': 'off',
				'wpcalypso/redux-no-bound-selectors': 'off',
				'wpcalypso/jsx-gridicon-size': 'off',
			},
		},
	],
};
