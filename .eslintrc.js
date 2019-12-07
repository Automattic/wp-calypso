/** @format */
const { merge } = require( 'lodash' );
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
			files: [ 'test/e2e/**/*' ],
			rules: {
				'import/no-nodejs-modules': 0,
				'import/no-extraneous-dependencies': 0,
				'no-console': 0,
				'jest/valid-describe': 0,
				'jest/no-test-prefixes': 0,
				'jest/no-identical-title': 0,
			},
			globals: {
				step: false,
			},
		},
		merge(
			// ESLint doesn't allow the `extends` field inside `overrides`, so we need to compose
			// the TypeScript config manually using internal bits from various plugins
			{},
			// base TypeScript config: parser options, add plugin with rules
			require( '@typescript-eslint/eslint-plugin' ).configs.base,
			// basic recommended rules config from the TypeScript plugin
			{ rules: require( '@typescript-eslint/eslint-plugin' ).configs.recommended.rules },
			// Prettier rules config
			require( 'eslint-config-prettier/@typescript-eslint' ),
			// Our own overrides
			{
				files: [ '**/*.ts', '**/*.tsx' ],
				rules: {
					'@typescript-eslint/explicit-function-return-type': 'off',
					'@typescript-eslint/explicit-member-accessibility': 'off',
					'@typescript-eslint/no-unused-vars': [ 'error', { ignoreRestSiblings: true } ],
					'@typescript-eslint/no-use-before-define': [
						'error',
						{ functions: false, typedefs: false },
					],
					'no-use-before-define': 'off',
					'@typescript-eslint/no-var-requires': 'off',
					// REST API objects include underscores
					'@typescript-eslint/camelcase': 'off',
					'valid-jsdoc': [
						2,
						{
							requireParamType: false,
							requireReturn: false,
							requireReturnType: false,
						},
					],
				},
			}
		),
	],
	env: {
		browser: true,
		jest: true,
		// mocha is only still on because we have not finished porting all of our tests to jest's syntax
		mocha: true,
		node: true,
	},
	globals: {
		// this is our custom function that's transformed by babel into either a dynamic import or a normal require
		asyncRequire: true,
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

		'no-restricted-imports': [
			2,
			{
				paths: [
					// Error if any module depends on the data-observe mixin, which is deprecated.
					'lib/mixins/data-observe',
					// Prevent naked import of gridicons module. Use 'components/gridicon' instead.
					{
						name: 'gridicons',
						message: "Please use 'components/gridicon' instead.",
					},
					// Prevent importing Redux's combineReducers.
					{
						name: 'redux',
						importNames: [ 'combineReducers' ],
						message: "`combineReducers` should be imported from 'state/utils', not 'redux'.",
					},
				],
			},
		],
		'no-restricted-modules': [
			2,
			{
				paths: [
					// Error if any module depends on the data-observe mixin, which is deprecated.
					'lib/mixins/data-observe',
					// Prevent naked import of gridicons module. Use 'components/gridicon' instead.
					{
						name: 'gridicons',
						message: "Please use 'components/gridicon' instead.",
					},
				],
			},
		],

		// Allows Chai `expect` expressions. Now that we're on jest, hopefully we can remove this one.
		'no-unused-expressions': 0,

		// enforce our classname namespacing rules
		'wpcalypso/jsx-classname-namespace': [
			2,
			{
				rootFiles: [ 'index.js', 'index.jsx', 'main.js', 'main.jsx' ],
			},
		],

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
