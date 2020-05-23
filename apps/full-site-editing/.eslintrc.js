module.exports = {
	plugins: [ 'jest' ],
	extends: [ 'plugin:jest/recommended', 'plugin:@wordpress/eslint-plugin/i18n' ],
	rules: {
		'import/no-extraneous-dependencies': [ 'error', { packageDir: __dirname } ],
		'react/react-in-jsx-scope': 0,
		'jsdoc/require-param-description': 0,
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'full-site-editing',
			},
		],
	},
	overrides: [
		{
			files: [ './**/?(*.)spec.[jt]s?(x)', './full-site-editing-plugin/e2e-test-helpers/**' ],
			globals: {
				page: 'readonly',
			},
		},
	],
};
