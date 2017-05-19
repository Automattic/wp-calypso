module.exports = {
	root: true,
	'extends': 'wpcalypso/react-a11y',
	parser: 'babel-eslint',
	env: {
		browser: true,
		mocha: true,
		node: true
	},
	globals: {
		asyncRequire: true,
		PROJECT_NAME: true
	},
	rules: {
		camelcase: 0, // REST API objects include underscores
		'jsx-a11y/label-has-for': 0, // Allow nested labels, which don't use `for`
		'max-len': [ 2, { code: 140 } ],
		'no-restricted-imports': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-unused-expressions': 0, // Allows Chai `expect` expressions
		'wpcalypso/jsx-classname-namespace': [ 2, {
			rootFiles: [ 'index.js', 'index.jsx', 'main.js', 'main.jsx' ],
		} ],
	}
};
