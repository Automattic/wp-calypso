module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: [ './tsconfig.json' ],
	},
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
			files: [ '**/*.stories.*', '**/stories/**', '**/__stories__/**' ],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
