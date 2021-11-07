module.exports = {
	env: {
		node: true,
	},
	rules: {
		// This is a node.js project, it is ok to import node modules
		'import/no-nodejs-modules': 'off',
		'no-process-exit': 'off',
	},
	overrides: [
		{
			files: [ './test_support/**/*' ],
			rules: {
				'jest/expect-expect': 'off',
				'jest/no-disabled-tests': 'off',
				'jest/valid-title': 'off',
				'jest/no-identical-title': 'off',
			},
		},
	],
};
