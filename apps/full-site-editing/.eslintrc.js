module.exports = {
	plugins: [ 'jest' ],
	extends: [ 'plugin:jest/recommended', 'plugin:@wordpress/eslint-plugin/i18n' ],
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'react/react-in-jsx-scope': 0,
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'full-site-editing',
			},
		],

		// FSE components render in a Gutenberg environment and should
		// conform to those naming conventions instead of Calypso's.
		'wpcalypso/jsx-classname-namespace': 0,
	},
	ignorePatterns: [ '**/dist/*' ],
	overrides: [
		{
			files: [ './**/?(*.)spec.[jt]s?(x)', './full-site-editing-plugin/e2e-test-helpers/**' ],
			globals: {
				page: 'readonly',
			},
		},
	],
};
