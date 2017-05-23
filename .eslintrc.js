module.exports = {
	root: true,
	'extends': [
		'wpcalypso/react',
		'plugin:jest/recommended',
	],
	parser: 'babel-eslint',
	env: {
		browser: true,
		'jest/globals': true,
		mocha: true,
		node: true
	},
	globals: {
		asyncRequire: true,
		PROJECT_NAME: true
	},
	plugins: [
		'jest'
	],
	rules: {
		camelcase: 0, // REST API objects include underscores
		'max-len': [ 2, { code: 140 } ],
		'no-restricted-imports': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-unused-expressions': 0, // Allows Chai `expect` expressions
		'wpcalypso/jsx-classname-namespace': [ 2, {
			rootFiles: [ 'index.js', 'index.jsx', 'main.js', 'main.jsx' ],
		} ],
		'wpcalypso/import-no-redux-combine-reducers': 2
	}
};
