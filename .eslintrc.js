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
	// Ideally, we should not have a `rules` block here at all, save for some
	// Calypso-specific rules (no-unused-expressions, camelcase). The remainder
	// are rules we cannot yet flag as errors, and should be removed over time
	// as outstanding issues are resolved.
	rules: {
		// REST API objects include underscores
		camelcase: 0,
		'max-len': [ 2, { code: 140 } ],
		'no-restricted-imports': [ 1, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 1, 'lib/sites-list', 'lib/mixins/data-observe' ],
		// Allows Chai `expect` expressions
		'no-unused-expressions': 0,
	}
};
