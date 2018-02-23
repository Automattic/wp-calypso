module.exports = {
	root: true,
	'extends': [
		'wpcalypso/react',
		'plugin:jsx-a11y/recommended',
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
		PROJECT_NAME: true,
		COMMIT_SHA: true,
	},
	plugins: [
		'jest',
		'jsx-a11y',
		'import',
	],
	rules: {
		camelcase: 0, // REST API objects include underscores
		'jest/valid-expect': 0,
		'jsx-a11y/anchor-has-content': 0, // i18n-calypso translate triggers false failures
		'max-len': [ 2, { code: 140 } ],
		'no-restricted-imports': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-unused-expressions': 0, // Allows Chai `expect` expressions
		'wpcalypso/jsx-classname-namespace': [ 2, {
			rootFiles: [ 'index.js', 'index.jsx', 'main.js', 'main.jsx' ],
		} ],
		'wpcalypso/import-no-redux-combine-reducers': 2,
		'import/no-nodejs-modules': [ 'error', { allow: [ 'querystring', 'url', 'events' ] } ],
		'import/no-extraneous-dependencies': [ 'error', { packageDir: './' } ],
	}
};
