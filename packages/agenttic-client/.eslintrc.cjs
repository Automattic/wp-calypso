module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'a8c-agenttic',
			},
		],
	},
	overrides: [
		{
			files: [
				'**/*.stories.*',
				'**/stories/**',
				'**/__stories__/**',
				'**/*.ts*',
			],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
