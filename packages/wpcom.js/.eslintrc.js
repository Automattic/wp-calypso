module.exports = {
	overrides: [
		{
			files: './examples/server/**/*',
			env: {
				node: true,
			},
			rules: {
				'import/no-nodejs-modules': 'off',
				'no-console': 'off',
			},
		},
	],
};
