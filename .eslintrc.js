const path = require( 'path' );
const { nodeConfig } = require( '@automattic/calypso-eslint-overrides' );
const { merge } = require( 'lodash' );
const reactVersion = require( './client/package.json' ).dependencies.react;

module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		babelOptions: {
			configFile: path.join( __dirname, './babel.config.js' ),
		},
	},
	extends: [
		'plugin:wpcalypso/react',
		'plugin:jsx-a11y/recommended',
		'plugin:jest/recommended',
		'plugin:prettier/recommended',
		'plugin:@tanstack/eslint-plugin-query/recommended',
		'plugin:md/prettier',
		'plugin:@wordpress/eslint-plugin/i18n',
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
			files: [ 'packages/**/*' ],
			rules: {
				// These two rules are to ensure packages don't import from calypso by accident to avoid circular deps.
				'no-restricted-imports': [ 'error', { patterns: [ 'calypso/*' ] } ],
				'no-restricted-modules': [ 'error', { patterns: [ 'calypso/*' ] } ],
			},
		},
		{
			files: [ 'bin/**/*', 'test/**/*' ],
			...nodeConfig,
		},
		merge(
			// ESLint doesn't allow the `extends` field inside `overrides`, so we need to compose
			// the TypeScript config manually using internal bits from various plugins
			{},
			// base TypeScript config: parser options, add plugin with rules
			require( '@typescript-eslint/eslint-plugin' ).configs.base,
			// basic recommended rules config from the TypeScript plugin
			{ rules: require( '@typescript-eslint/eslint-plugin' ).configs.recommended.rules },
			// disables rules that are already checked by the TypeScript compiler
			// see https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/src/configs#eslint-recommended
			{
				rules: require( '@typescript-eslint/eslint-plugin' ).configs[ 'eslint-recommended' ]
					.overrides[ 0 ].rules,
			},
			// Prettier rules config
			require( 'eslint-config-prettier' ),
			// Our own overrides
			{
				files: [ '**/*.ts', '**/*.tsx' ],
				rules: {
					// Disable vanilla eslint rules that have a Typescript implementation
					// See https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/README.md#extension-rules
					'brace-style': 'off',
					'comma-dangle': 'off',
					'comma-spacing': 'off',
					curly: 'error', // The base curly rule does not seem to apply to TS files.
					'default-param-last': 'off',
					'dot-notation': 'off',
					'func-call-spacing': 'off',
					indent: 'off',
					'init-declarations': 'off',
					'keyword-spacing': 'off',
					'lines-between-class-members': 'off',
					'no-array-constructor': 'off',
					'no-dupe-class-members': 'off',
					'no-duplicate-imports': 'off',
					'no-empty-function': 'off',
					'no-extra-parens': 'off',
					'no-extra-semi': 'off',
					'no-invalid-this': 'off',
					'no-loop-func': 'off',
					'no-loss-of-precision': 'off',
					'no-magic-numbers': 'off',
					'no-redeclare': 'off',
					'no-shadow': 'off',
					'no-unused-expressions': 'off',
					'no-unused-vars': 'off',
					'no-use-before-define': 'off',
					'no-useless-constructor': 'off',
					quotes: [ 'error', 'single', 'avoid-escape' ],
					'require-await': 'off',
					'return-await': 'off',
					semi: 'off',
					'space-before-function-paren': 'off',
					'@typescript-eslint/ban-ts-comment': [
						'error',
						{
							'ts-check': 'allow-with-description',
							'ts-expect-error': 'allow-with-description',
							'ts-ignore': 'allow-with-description',
							'ts-nocheck': 'allow-with-description',
						},
					],
					'@typescript-eslint/ban-types': [
						'error',
						{
							types: {
								ReactText: {
									message:
										"It's deprecated, so we don't want new uses. Inline the required type (such as string or number) instead.",
								},
								[ 'React.ReactText' ]: {
									message:
										"It's deprecated, so we don't want new uses. Inline the required type (such as string or number) instead.",
								},
								ReactChild: {
									message:
										"It's deprecated, so we don't want new uses. Prefer types like ReactElement, string, or number instead. If the type should be nullable, use ReactNode.",
								},
								[ 'React.ReactChild' ]: {
									message:
										"It's deprecated, so we don't want new uses. Prefer types like ReactElement, string, or number instead. If the type should be nullable, use ReactNode.",
								},
							},
							extendDefaults: true,
						},
					],
					'@typescript-eslint/no-explicit-any': 'warn',
					'@typescript-eslint/explicit-function-return-type': 'off',
					'@typescript-eslint/explicit-member-accessibility': 'off',
					'@typescript-eslint/no-unused-vars': [ 'error', { ignoreRestSiblings: true } ],
					'@typescript-eslint/no-use-before-define': [
						'error',
						{ functions: false, typedefs: false },
					],
					'@typescript-eslint/no-var-requires': 'off',
					// REST API objects include underscores
					'@typescript-eslint/camelcase': 'off',

					// TypeScript compiler already takes care of these errors
					'import/no-extraneous-dependencies': 'off',
					'import/named': 'off',
					'import/namespace': 'off',
					'import/default': 'off',
				},
			}
		),
		{
			// This lints the codeblocks marked as `javascript`, `js`, `cjs` or `ejs`, all valid aliases
			// See:
			//  * https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md)
			//  * https://www.npmjs.com/package/eslint-plugin-md#modifying-eslint-setup-for-js-code-inside-md-files
			files: [
				'*.md.js',
				'*.md.javascript',
				'*.md.cjs',
				'*.md.ejs',
				'*.md.jsx',
				'*.md.tsx',
				'*.md.ts',
			],
			rules: {
				// These are ok for examples
				'import/no-extraneous-dependencies': 'off',
				'jest/expect-expect': 'off',
				'jest/no-focused-tests': 'off',
				'jest/no-standalone-expect': 'off',
				'jsdoc/require-param-description': 'off',
				'no-console': 'off',
				'no-redeclare': 'off',
				'no-restricted-imports': 'off',
				'no-undef': 'off',
				'no-unused-vars': 'off',
				'react/jsx-no-undef': 'off',
				'react/jsx-uses-react': 'off',
				'react/react-in-jsx-scope': 'off',
				'wpcalypso/jsx-classname-namespace': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'jsdoc/require-param': 'off',
				'jsdoc/check-param-names': 'off',
				'@typescript-eslint/no-empty-function': 'off',
				'prettier/prettier': [ 'error', { parser: 'babel' } ],
			},
		},
		{
			files: [ '*.json' ],
			extends: [ 'plugin:@automattic/json/recommended' ],
			rules: {
				// JSON doesn't allow dangle comma or comments
				'comma-dangle': 'off',
				'json-es/no-comments': 'error',
			},
			overrides: [
				{
					// Default settings for all package.json files
					files: [ 'package.json' ],
					rules: {
						'@automattic/json/prefer-property-order': 'off',
						'@automattic/json/require-keywords': 'off',
						'@automattic/json/require-repository-directory': 'error',
						'@automattic/json/valid-values-author': [ 'error', [ 'Automattic Inc.' ] ],
						'@automattic/json/valid-values-license': [ 'error', [ 'GPL-2.0-or-later' ] ],
						'@automattic/json/valid-values-name-scope': [ 'error', [ '@automattic' ] ],
						'@automattic/json/valid-values-publishConfig': [ 'error', [ { access: 'public' } ] ],
					},
				},
				{
					files: [ './config/*.json' ],
					rules: {
						'sort-keys': 'warn',
					},
				},
				{
					// These files don't have the `@automattic` prefix in the name
					files: [
						'./package.json',
						'./client/package.json',
						'./desktop/package.json',
						'./test/e2e/package.json',
						'./packages/calypso-codemods/package.json',
						'./packages/wpcom-proxy-request/package.json',
						'./packages/wpcom-xhr-request/package.json',
						'./packages/wpcom.js/package.json',
						'./packages/eslint-plugin-wpcalypso/package.json',
						'./packages/i18n-calypso-cli/package.json',
						'./packages/i18n-calypso/package.json',
						'./packages/i18n-utils/package.json',
						'./packages/photon/package.json',
					],
					rules: {
						'@automattic/json/valid-values-name-scope': 'off',
					},
				},
				{
					// These files don't have GPL license
					files: [
						'./desktop/package.json',
						'./packages/material-design-icons/package.json',
						'./packages/wpcom-proxy-request/package.json',
						'./packages/wpcom-xhr-request/package.json',
						'./packages/wpcom.js/package.json',
					],
					rules: {
						'@automattic/json/valid-values-license': 'off',
					},
				},
				{
					// These files are "fake" package.json files, only there to configure webpack bundling
					files: [ './client/**/package.json' ],
					excludedFiles: './client/package.json',
					rules: {
						'@automattic/json/require-repository-directory': 'off',
						'@automattic/json/valid-values-name-scope': 'off',
						'@automattic/json/require-author': 'off',
						'@automattic/json/require-description': 'off',
						'@automattic/json/require-license': 'off',
						'@automattic/json/require-name': 'off',
						'@automattic/json/require-version': 'off',
					},
				},
				{
					// These files are parsed as jsonc (JSON With Comments)
					files: [ 'tsconfig.json' ],
					rules: {
						'json-es/no-comments': 'off',
					},
				},
			],
		},
	],
	env: {
		jest: true,
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
	plugins: [ 'import', 'you-dont-need-lodash-underscore', '@tanstack/query' ],
	settings: {
		react: {
			version: reactVersion,
		},
		jsdoc: {
			mode: 'typescript',
		},
		'import/internal-regex': '^calypso/',
	},
	rules: {
		// REST API objects include underscores
		camelcase: 'off',

		// Curly is not added by existing presets and is needed for WordPress style compatibility.
		curly: 'error',

		'no-constant-condition': [ 'error', { checkLoops: false } ],

		'no-path-concat': 'error',

		'one-var': [ 'error', 'never' ],

		// TODO: why did we turn this off?
		'jest/valid-expect': 'off',

		'jest/expect-expect': [
			'error',
			{
				assertFunctionNames: [
					// Jest
					'expect',
				],
			},
		],

		// Only use known tag names plus `jest-environment`.
		'jsdoc/check-tag-names': [
			'error',
			{ definedTags: [ 'jest-environment', 'jsxImportSource' ] },
		],

		// Do not require param/return description, see https://github.com/Automattic/wp-calypso/issues/56330
		'jsdoc/require-param-description': 'off',
		'jsdoc/require-param': 'off',
		'jsdoc/require-returns-description': 'off',

		// Deprecated rule, fails in some valid cases with custom input components
		'jsx-a11y/label-has-for': 'off',

		// i18n-calypso translate triggers false failures
		'jsx-a11y/anchor-has-content': 'off',

		// Deprecated rule, the problems using <select> with keyboards this addressed don't appear to be an issue anymore
		// https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/398
		'jsx-a11y/no-onchange': 'off',

		'no-restricted-imports': [
			2,
			{
				paths: [
					// Prevent naked import of gridicons module. Use 'components/gridicon' instead.
					{
						name: 'gridicons',
						message: "Please use '@automattic/components' instead.",
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
		'react/display-name': 'error',
		'react/jsx-curly-brace-presence': [ 'error', { props: 'never', children: 'never' } ],
		'react/jsx-boolean-value': 'error',
		// enforce our classname namespacing rules
		'wpcalypso/jsx-classname-namespace': 'error',

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

		// Force packages to declare their dependencies
		'import/no-extraneous-dependencies': 'error',
		'import/named': 'error',
		'import/namespace': 'error',
		'import/default': 'error',
		'import/no-duplicates': 'error',
		'import/order': [
			'error',
			{
				'newlines-between': 'never',
				alphabetize: {
					order: 'asc',
				},
				groups: [ 'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type' ],
			},
		],

		'wpcalypso/no-unsafe-wp-apis': [
			'warn',
			{
				'@wordpress/block-editor': [
					'__experimentalBlock',
					// InserterMenuExtension has been made unstable in this PR: https://github.com/WordPress/gutenberg/pull/31417 / Gutenberg v10.7.0-rc.1.
					// We need to support both symbols until we're sure Gutenberg < v10.7.x is not used anymore in WPCOM.
					'__unstableInserterMenuExtension',
					'__experimentalInserterMenuExtension',
				],
				'@wordpress/compose': [ '__experimentalUseFocusOutside' ],
				'@wordpress/date': [ '__experimentalGetSettings' ],
				'@wordpress/edit-post': [ '__experimentalMainDashboardButton' ],
				'@wordpress/components': [
					'__experimentalDivider',
					'__experimentalHStack',
					'__experimentalVStack',
					'__experimentalSpacer',
					'__experimentalItem',
					'__experimentalItemGroup',
					'__experimentalNavigationBackButton',
					'__experimentalNavigatorBackButton',
					'__experimentalNavigatorToParentButton',
					'__experimentalNavigatorButton',
					'__experimentalNavigatorProvider',
					'__experimentalNavigatorScreen',
					'__experimentalUseNavigator',
					'__experimentalNumberControl',
					'__unstableComposite',
					'__unstableCompositeItem',
					'__unstableUseCompositeState',
				],
			},
		],

		// Disabled, because in packages we are using globally defined `__i18n_text_domain__` constant at compile time
		'@wordpress/i18n-text-domain': 'off',

		// Disable Lodash methods that we've already migrated away from, see p4TIVU-9Bf-p2 for more details.
		'you-dont-need-lodash-underscore/all': 'error',
		'you-dont-need-lodash-underscore/any': 'error',
		'you-dont-need-lodash-underscore/assign': 'error',
		'you-dont-need-lodash-underscore/bind': 'error',
		'you-dont-need-lodash-underscore/cast-array': 'error',
		'you-dont-need-lodash-underscore/collect': 'error',
		'you-dont-need-lodash-underscore/contains': 'error',
		'you-dont-need-lodash-underscore/detect': 'error',
		'you-dont-need-lodash-underscore/drop': 'error',
		'you-dont-need-lodash-underscore/drop-right': 'error',
		'you-dont-need-lodash-underscore/each': 'error',
		'you-dont-need-lodash-underscore/ends-with': 'error',
		'you-dont-need-lodash-underscore/entries': 'error',
		'you-dont-need-lodash-underscore/every': 'error',
		'you-dont-need-lodash-underscore/extend-own': 'error',
		'you-dont-need-lodash-underscore/fill': 'error',
		'you-dont-need-lodash-underscore/first': 'error',
		'you-dont-need-lodash-underscore/foldl': 'error',
		'you-dont-need-lodash-underscore/foldr': 'error',
		'you-dont-need-lodash-underscore/index-of': 'error',
		'you-dont-need-lodash-underscore/inject': 'error',
		'you-dont-need-lodash-underscore/is-array': 'error',
		'you-dont-need-lodash-underscore/is-finite': 'error',
		'you-dont-need-lodash-underscore/is-function': 'error',
		'you-dont-need-lodash-underscore/is-integer': 'error',
		'you-dont-need-lodash-underscore/is-nan': 'error',
		'you-dont-need-lodash-underscore/is-nil': 'error',
		'you-dont-need-lodash-underscore/is-null': 'error',
		'you-dont-need-lodash-underscore/is-string': 'error',
		'you-dont-need-lodash-underscore/is-undefined': 'error',
		'you-dont-need-lodash-underscore/join': 'error',
		'you-dont-need-lodash-underscore/last-index-of': 'error',
		'you-dont-need-lodash-underscore/pad-end': 'error',
		'you-dont-need-lodash-underscore/pad-start': 'error',
		'you-dont-need-lodash-underscore/reduce-right': 'error',
		'you-dont-need-lodash-underscore/repeat': 'error',
		'you-dont-need-lodash-underscore/replace': 'error',
		'you-dont-need-lodash-underscore/reverse': 'error',
		'you-dont-need-lodash-underscore/select': 'error',
		'you-dont-need-lodash-underscore/slice': 'error',
		'you-dont-need-lodash-underscore/split': 'error',
		'you-dont-need-lodash-underscore/take-right': 'error',
		'you-dont-need-lodash-underscore/to-lower': 'error',
		'you-dont-need-lodash-underscore/to-pairs': 'error',
		'you-dont-need-lodash-underscore/to-upper': 'error',
		'you-dont-need-lodash-underscore/uniq': 'error',

		// @TODO remove these lines once we fixed the warnings so
		// they'll become errors for new code added to the codebase
		'@tanstack/query/exhaustive-deps': 'warn',
		'@wordpress/i18n-no-flanking-whitespace': 'warn',
		'@wordpress/i18n-hyphenated-range': 'warn',
	},
};
