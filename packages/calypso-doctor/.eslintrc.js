module.exports = {
	env: {
		node: true,
	},
	rules: {
		// This is a node.js project, it is ok to import node modules
		'import/no-nodejs-modules': 'off',

		// We have functions called `test` that are not related to jest at all
		'jest/expect-expect': 'off',
		'jest/no-disabled-tests': 'off',
		'jest/no-export': 'off',
		'jest/no-test-callback': 'off',

		// This is a CLI tool, we use console a lot
		'no-console': 'off',
	},
};
