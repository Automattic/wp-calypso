const { merge } = require( 'lodash' );
const path = require( 'path' );
const reactVersion = require( './client/package.json' ).dependencies.react;

module.exports = {
	root: true,
	extends: [
		'wpcalypso/react',
		'plugin:jsx-a11y/recommended',
		'plugin:jest/recommended',
		'plugin:prettier/recommended',
		'prettier/react',
		'plugin:md/prettier',
	],
	overrides: [
		{
			// Nothing to override for these files. This is here so eslint also checks for `.jsx` files by default
			files: [ '**/*.jsx' ],
		},
		{
			files: [ '*.md' ],
			parser: 'markdown-eslint-parser',
			rules: {
				'md/remark': [
					'error',
					{
						plugins: [
							// This is the original ruleset from `plugin:md/prettier`.
							// We need to include it again because eslint doesn't compose overrides
							...require( 'eslint-plugin-md' ).configs.prettier.rules[ 'md/remark' ][ 1 ].plugins,

							// Disabled because they don't make a lot of sense or they are buggy
							[ 'lint-maximum-heading-length', false ],
							[ 'lint-no-duplicate-headings', false ],

							// Rules we would like to enable eventually. Violations needs to be fixed manually before enabling the rule.
							[ 'lint-fenced-code-flag', false ],

							// This special plugin is used to allow the syntax <!--eslint ignore <rule>-->. It has to come last.
							[ 'message-control', { name: 'eslint', source: 'remark-lint' } ],
						],
					},
				],
			},
		},
		{
			// This lints the codeblocks marked as `javascript`, `js`, `cjs` or `ejs`, all valid aliases
			// See:
			// eslint-disable-next-line inclusive-language/use-inclusive-words
			//  * https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md)
			//  * https://www.npmjs.com/package/eslint-plugin-md#modifying-eslint-setup-for-js-code-inside-md-files
			files: [ '*.md.js', '*.md.javascript', '*.md.cjs', '*.md.ejs', '*.md.jsx' ],
			rules: {
				// These are ok for examples
				'import/no-extraneous-dependencies': 'off',
				'jest/expect-expect': 'off',
				'jsdoc/require-param-description': 'off',
				'no-console': 'off',
				'no-redeclare': 'off',
				'no-restricted-imports': 'off',
				'no-undef': 'off',
				'no-unused-vars': 'off',
				'react/jsx-no-undef': 'off',
				'react/react-in-jsx-scope': 'off',
				'wpcalypso/import-docblock': 'off',
				'wpcalypso/jsx-classname-namespace': 'off',
			},
		},
		{
			// Eventually the whole repo should follow this rule. This is the list of the folders we have
			// already cleaned up. Once we have cleaned all repo, this override should dissapear and the rule
			// should be enabled as a regular `rule`.
			files: [ 'packages/**/*' ],
			rules: {
				'import/no-extraneous-dependencies': 'error',
			},
		},
		{
			files: [ 'bin/**/*' ],
			rules: {
				'import/no-nodejs-modules': 'off',
				'no-console': 'off',
				'no-process-exit': 'off',
				'valid-jsdoc': 'off',
			},
		},
		{
			files: [ 'test/e2e/**/*' ],
			rules: {
				'import/no-nodejs-modules': 'off',
				'no-console': 'off',

				// Disable all rules from "plugin:jest/recommended", as e2e tests use mocha
				...Object.keys( require( 'eslint-plugin-jest' ).configs.recommended.rules ).reduce(
					( disabledRules, key ) => ( { ...disabledRules, [ key ]: 'off' } ),
					{}
				),
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
				},
			}
		),
	],
	env: {
		jest: true,
		// mocha is only still on because we have not finished porting all of our tests to jest's syntax
		mocha: true,
		node: true,
	},
	globals: {
		// allow the browser globals. ESLint's `browser` env is too permissive and allows referencing
		// directly hundreds of properties that are available on `window` and `document`. That
		// frequently caused bugs where we used an undefined variable and ESLint didn't warn us.
		globalThis: true,
		window: true,
		document: true,
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
		jsdoc: {
			mode: 'typescript',
		},
	},
	rules: {
		// REST API objects include underscores
		camelcase: 'off',

		// TODO: why did we turn this off?
		'jest/valid-expect': 'off',

		'jest/expect-expect': [
			'error',
			{
				assertFunctionNames: [
					// Jest
					'expect',

					// Chai
					'chai.assert',
					'chai.assert.*',
					'assert',
					'assert.*',
					'equal',
					'ok',
					'deepStrictEqual',
					'chaiExpect',

					// Sinon
					'sinon.assert.*',
				],
			},
		],

		// Only use known tag names plus `jest-environment`.
		'jsdoc/check-tag-names': [ 'error', { definedTags: [ 'jest-environment' ] } ],

		// Deprecated rule, fails in some valid cases with custom input components
		'jsx-a11y/label-has-for': 'off',

		// i18n-calypso translate triggers false failures
		'jsx-a11y/anchor-has-content': 'off',

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
					// Use fetch instead of superagent.
					{
						name: 'superagent',
						message: 'Please use native `fetch` instead.',
					},
					// Use `@wordpress/icons` instead of `Icon` or `Dashicon` from `@wordpress/components`.
					{
						name: '@wordpress/components',
						importNames: [ 'Dashicon', 'Icon' ],
						message: 'Please use `@wordpress/icons` instead.',
					},
					// Use `lib/url` instead of Node's 'url'.
					{
						name: 'url',
						message:
							"Node's `url` is deprecated. Please consider migrating to `lib/url` (see `client/lib/url/README.md`).",
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
					// Use fetch instead of superagent.
					{
						name: 'superagent',
						message: 'Please use native `fetch` instead.',
					},
				],
			},
		],

		// Allows Chai `expect` expressions. Now that we're on jest, hopefully we can remove this one.
		'no-unused-expressions': 'off',

		'react/forbid-foreign-prop-types': 'error',

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

		/**
		 * temporarily demote inclusive language rule to a warning until we clear the repository
		 * and allow certain terms that we can't fix yet due to complexity or lack of control over the name
		 */
		'inclusive-language/use-inclusive-words': [
			'warn',
			{
				words: [],
				allowedTerms: [
					// `masterbar` is going to require a whole lot of coordination across multiple repositories
					// to fix and it's unclear when that will be possible
					{ term: 'masterbar', allowPartialMatches: true },

					// It's not likely that this will change
					{ term: 'mastercard', allowPartialMatches: true },

					// The next two are stored in a site's meta so would require a data migration of all sites to fix
					'comment_whitelist',
					'blacklist_keys',

					// For HotJar compatibility. HJ will reach out to @saramarcondes once a new
					// and inclusive attribute name exists to be used: https://github.com/Automattic/wp-calypso/pull/43348#discussion_r442015229
					'data-hj-whitelist',

					// Depends on https://github.com/Automattic/jetpack/blob/3dae8f80e5020338e84bfc20bb41786f056a2eec/json-endpoints/jetpack/class.wpcom-json-api-get-option-endpoint.php#L38
					'option_name_not_in_whitelist',

					// Depends on https://github.com/Automattic/jetpack/blob/792b26b5539d07cc35fdd93567942f2ad481eef2/modules/protect/shared-functions.php#L74
					'jetpack_protect_global_whitelist',

					// These are WP.com errors that need coordination to change
					// https://github.com/Automattic/wp-calypso/issues/43998
					'site_blacklisted',
					'blacklisted_domain',
				],
			},
		],
		// Disabled for now until we finish the migration
		'wpcalypso/no-package-relative-imports': [
			'off',
			{
				mappings: [
					{
						dir: path.join( __dirname, 'client' ),
						module: 'calypso',
					},
				],
				warnOnNonLiteralImport: true,
				automaticExtensions: [ '.js', '.ts', '.json', '.jsx', '.tsx' ],
			},
		],

		// Force packages to declare their dependencies
		'import/no-extraneous-dependencies': 'error',
	},
};
