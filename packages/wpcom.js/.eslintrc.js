module.exports = {
	env: {
		browser: true,
	},
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
		{
			files: './test/**/*',
			rules: {
				// These files use a weird mixture of CJS and ESM. Disabling the rules for now until they can
				// get refactored.
				'import/default': 'off',

				// Test can use Node modules
				'import/no-nodejs-modules': 'off',
			},
		},
	],
};
