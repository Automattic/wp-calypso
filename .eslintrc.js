/** @format */

const reactVersion = require( './package.json' ).dependencies.react;

module.exports = {
	root: true,
	extends: [
		'wpcalypso/react',
		'plugin:jsx-a11y/recommended',
		'plugin:jest/recommended',
		'prettier',
		'prettier/react',
	],
	overrides: [
		{
			files: [ 'bin/**/*' ],
			rules: {
				'import/no-nodejs-modules': 0,
				'no-console': 0,
				'no-process-exit': 0,
				'valid-jsdoc': 0,
			},
		},
		{
			files: [ 'client/gutenberg/extensions/**/*' ],
			rules: {
				'react/forbid-elements': [
					'error',
					{
						forbid: [
							[ 'circle', 'Circle' ],
							[ 'g', 'G' ],
							[ 'path', 'Path' ],
							[ 'polygon', 'Polygon' ],
							[ 'rect', 'Rect' ],
							[ 'svg', 'SVG' ],
						].map( ( [ element, componentName ] ) => ( {
							element,
							message: `use <${ componentName }> from @wordpress/components`,
						} ) ),
					},
				],
				'react/react-in-jsx-scope': 0,
				'wpcalypso/jsx-classname-namespace': 0,
			},
		},
	],
	parser: 'babel-eslint',
	env: {
		browser: true,
		'jest/globals': true,
		// mocha is only still on because we have not finished porting all of our tests to jest's syntax
		mocha: true,
		node: true,
	},
	globals: {
		// this is our custom function that's transformed by babel into either a dynamic import or a normal require
		asyncRequire: true,
		// this is the name of the project from the build config. Injected at boot in a script tag.
		PROJECT_NAME: true,
		// this is the SHA of the current commit. Injected at boot in a script tag.
		COMMIT_SHA: true,
		// this is when Webpack last built the bundle
		BUILD_TIMESTAMP: true,
	},
	plugins: [ 'jest', 'jsx-a11y', 'import' ],
	settings: {
		react: {
			version: reactVersion,
		},
	},
	rules: {
		// REST API objects include underscores
		camelcase: 0,

		// TODO: why did we turn this off?
		'jest/valid-expect': 0,

		// Deprecated rule, fails in some valid cases with custom input components
		'jsx-a11y/label-has-for': 0,

		// i18n-calypso translate triggers false failures
		'jsx-a11y/anchor-has-content': 0,

		// error if any module depends on the data-observe mixin, which is deprecated
		'no-restricted-imports': [ 2, 'lib/mixins/data-observe' ],
		'no-restricted-modules': [ 2, 'lib/mixins/data-observe' ],

		// Allows Chai `expect` expressions. Now that we're on jest, hopefully we can remove this one.
		'no-unused-expressions': 0,

		// enforce our classname namespacing rules
		'wpcalypso/jsx-classname-namespace': [
			2,
			{
				rootFiles: [ 'index.js', 'index.jsx', 'main.js', 'main.jsx' ],
			},
		],

		// Force folks to use our custom combineReducers function instead of the plain redux one
		// This allows us to control serialization for every reducer.
		'wpcalypso/import-no-redux-combine-reducers': 2,

		// Disallow importing of native node modules, with some exceptions
		// - url because we use it all over the place to parse and build urls
		// - events because we use it for some event emitters
		// - path because we use it quite a bit
		'import/no-nodejs-modules': [ 'error', { allow: [ 'url', 'events', 'path', 'config' ] } ],

		// Disallow importing or requiring packages that are not listed in package.json
		// This prevents us from depending on transitive dependencies, which could break in unexpected ways.
		'import/no-extraneous-dependencies': [ 'error', { packageDir: './' } ],
	},
};
