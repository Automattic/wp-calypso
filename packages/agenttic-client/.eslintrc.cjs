module.exports = {
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
