module.exports = {
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
	},
	overrides: [
		{
			files: [ '*.md.jsx', '*.md.js' ],
			rules: {
				'import/no-extraneous-dependencies': 'off',
				'wpcalypso/i18n-named-placeholders': 'off',
				'wpcalypso/i18n-no-variables': 'off',
			},
		},
	],
};
