/* eslint-disable import/no-commonjs */
const resolveConfig = require( './webpack.config.resolve.js' );

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
	plugins: [
		'import'
	],
	settings: {
		'import/ignore': [
			'server\/.*$',
		],
		'import/resolver': {
			webpack: {
				config: {
					resolve: resolveConfig,
				}
			},
		}
	},
	rules: {
		camelcase: 0, // REST API objects include underscores
		// NOTE: Some import rules are errors in client and warnings in server
		//       due to how CommonJS and ES module notations inter-op.
		'import/default': 2,
		'import/export': 2,
		'import/named': 2,
		'import/namespace': 2,
		'import/no-commonjs': 1,
		'import/no-duplicates': 2,
		'import/no-mutable-exports': 2,
		'import/no-named-as-default-member': 1,
		'import/no-named-as-default': 1,
		'import/no-unresolved': 2,
		'import/no-webpack-loader-syntax': 1,
		'max-len': [ 2, { code: 140 } ],
		'no-restricted-imports': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 2, 'lib/sites-list', 'lib/mixins/data-observe' ],
		'no-unused-expressions': 0, // Allows Chai `expect` expressions
	}
};
