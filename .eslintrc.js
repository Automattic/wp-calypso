module.exports = {
	root: true,
	'extends': 'wpcalypso/react',
	parser: 'babel-eslint',
	env: {
		browser: true,
		mocha: true,
		node: true
	},
	globals: {
		asyncRequire: true
	},
	rules: {
		camelcase: 0, // REST API objects include underscores
		'no-unused-expressions': 0, // Allows Chai `expect` expressions
	}
};
