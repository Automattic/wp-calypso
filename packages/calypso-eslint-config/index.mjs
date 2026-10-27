import fs from 'node:fs';
import path from 'node:path';
import { flatNodeConfig } from '@automattic/calypso-eslint-overrides';
import json from '@automattic/eslint-plugin-json';
import { fixupPluginRules, includeIgnoreFile } from '@eslint/compat';
import markdown from '@eslint/markdown';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import wordpress from '@wordpress/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import wpcalypso from 'eslint-plugin-wpcalypso';
import globals from 'globals';

// Shared with `client/server`, which allows `superagent`.
export const restrictedImports = [
	'error',
	{
		patterns: [
			{
				group: [ '**/*.png', '**/*.jpg', '**/*.jpeg' ],
				message:
					"Please use 'webp' files instead. You can convert using `brew install webp && cwebp -q 90 -alpha_q 85 -m 6 <input>.png -o <output>.webp`",
			},
		],
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
			// Use Redux's `compose` instead of lodash's `flowRight`.
			{
				name: 'lodash',
				importNames: [ 'flowRight' ],
				message: "Please use `compose` from 'redux' instead.",
			},
		],
	},
];

// Code blocks in Markdown files are linted as virtual files named `<name>.md/<index>.<ext>`.
const markdownCodeBlocks = [ 'js', 'cjs', 'ejs', 'jsx', 'ts', 'tsx' ].map(
	( ext ) => `**/*.md/*.${ ext }`
);

// Blocks tagged `typescript`, unlike `ts`, have never been linted: most are incomplete snippets. The
// processor names both `.ts`, so rename that tag to one no config matches, keeping its length so
// positions in the file still line up.
const codeBlocks = markdown.processors.markdown;
const markdownProcessor = {
	...codeBlocks,
	meta: { name: 'calypso/markdown', version: codeBlocks.meta.version },
	preprocess: ( text, filename ) =>
		codeBlocks.preprocess( text.replace( /^(\s*```)typescript\b/gm, '$1snippet-ts' ), filename ),
};

// `flatNodeConfig` without its top-level `return` support: every file here is an ES module.
export const nodeConfig = {
	languageOptions: { globals: flatNodeConfig.languageOptions.globals },
	rules: flatNodeConfig.rules,
};

export const browserGlobals = globals.browser;

// The config for the checkout at `rootDir`, with its paths and patterns relative to it.
function build( rootDir ) {
	const reactVersion = JSON.parse(
		fs.readFileSync( path.join( rootDir, 'client/package.json' ), 'utf8' )
	).dependencies.react;

	const config = defineConfig( [
		includeIgnoreFile( path.join( rootDir, '.prettierignore' ) ),
		{
			name: 'calypso/ignores',
			// Like `.eslintrc` lookups, skip dotfiles and dot-directories.
			ignores: [ '**/.*' ],
		},

		{
			name: 'calypso/linter-options',
			// The legacy default; flat config warns about unused disable comments.
			linterOptions: { reportUnusedDisableDirectives: 'off' },
		},

		wpcalypso.configs.react,
		{
			// JSON files, such as config, may hold unlocalized URLs.
			files: [ '**/*.json' ],
			rules: { 'wpcalypso/i18n-unlocalized-url': 'off' },
		},
		jsxA11y.flatConfigs.recommended,
		jest.configs[ 'flat/recommended' ],
		prettierRecommended,
		tanstackQuery.configs[ 'flat/recommended' ],

		{
			name: 'calypso/base',
			languageOptions: {
				parser: typescriptParser,
				globals: {
					...globals.jest,
					...globals.node,
					// allow the browser globals. ESLint's `browser` env is too permissive and allows referencing
					// directly hundreds of properties that are available on `window` and `document`. That
					// frequently caused bugs where we used an undefined variable and ESLint didn't warn us.
					globalThis: 'writable',
					window: 'writable',
					document: 'writable',
					// this is the SHA of the current commit. Injected at boot in a script tag.
					COMMIT_SHA: 'writable',
					// this is when Webpack last built the bundle
					BUILD_TIMESTAMP: 'writable',
				},
			},
			plugins: {
				// Its rules still call methods that ESLint 10 removed.
				import: fixupPluginRules( importPlugin ),
				'@typescript-eslint': typescriptEslint,
				'@wordpress': wordpress,
			},
			settings: {
				react: {
					version: reactVersion,
				},
				jsdoc: {
					mode: 'typescript',
				},
				'import/internal-regex': '^calypso/',
				// Workspace packages resolve to their real folders. Keep them external for `import/order`
				// in root-level files too, as they are when reached through `node_modules`.
				'import/external-module-folders': [ 'node_modules', 'packages', 'apps' ],
				'import/resolver': {
					[ path.join( rootDir, 'build-tools/eslint/import-resolver-calypso-src.js' ) ]: {},
					node: {},
				},
				// Workspace packages resolve to source, which can be JSX or TypeScript.
				'import/extensions': [ '.js', '.mjs', '.cjs', '.jsx' ],
				// As in the plugin's `import/typescript` preset, which can't be extended because it
				// turns `import/named` off.
				'import/parsers': {
					'@typescript-eslint/parser': [ '.ts', '.tsx' ],
				},
			},
			rules: {
				...wordpress.configs.i18n[ 0 ].rules,
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
					{ definedTags: [ 'jest-environment', 'jest-environment-options', 'jsxImportSource' ] },
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

				'no-restricted-imports': restrictedImports,
				'wpcalypso/no-import-lodash': 'error',
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
							'__experimentalConfirmDialog',
							'__experimentalHStack',
							'__experimentalVStack',
							'__experimentalSpacer',
							'__experimentalText',
							'__experimentalHeading',
							'__experimentalInputControl',
							'__experimentalInputControlPrefixWrapper',
							'__experimentalInputControlSuffixWrapper',
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
							'__experimentalTruncate',
							'__unstableComposite',
							'__unstableCompositeItem',
							'__unstableUseCompositeState',
						],
					},
				],

				// Disabled, because in packages we are using globally defined `__i18n_text_domain__` constant at compile time
				'@wordpress/i18n-text-domain': 'off',

				// @TODO remove these lines once we fixed the warnings so
				// they'll become errors for new code added to the codebase
				'@tanstack/query/exhaustive-deps': 'warn',
			},
		},

		{
			// Lint `.jsx` files too.
			files: [ '**/*.jsx' ],
		},
		{
			// Lints the code blocks in Markdown files, not the Markdown itself.
			name: 'calypso/markdown',
			files: [ '**/*.md' ],
			processor: markdownProcessor,
		},
		{
			files: [ 'packages/**' ],
			rules: {
				// The `calypso/*` patterns ensure packages don't import from calypso by
				// accident to avoid circular deps.
				'no-restricted-imports': [ 'error', { patterns: [ { group: [ 'calypso/*' ] } ] } ],
				'no-restricted-modules': [ 'error', { patterns: [ 'calypso/*' ] } ],
			},
		},
		{
			...nodeConfig,
			files: [ '**/bin/**', '**/test/**', '**/webpack.config.js', '**/eslint.config.mjs' ],
		},
		{
			files: [ '**/test/**' ],
			rules: {
				'react/display-name': 'off',
			},
		},
		{
			files: [ '**/*.ts', '**/*.tsx' ],
			languageOptions: {
				parser: typescriptParser,
				parserOptions: typescriptEslint.configs.base.parserOptions,
			},
			rules: {
				// basic recommended rules config from the TypeScript plugin
				...typescriptEslint.configs.recommended.rules,
				// disables rules that are already checked by the TypeScript compiler
				// see https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin/src/configs#eslint-recommended
				...typescriptEslint.configs[ 'eslint-recommended' ].overrides[ 0 ].rules,
				...eslintConfigPrettier.rules,
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
				'@typescript-eslint/no-restricted-types': [
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
					},
				],
				'@typescript-eslint/no-explicit-any': 'warn',
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-member-accessibility': 'off',
				'@typescript-eslint/no-unused-vars': [
					'error',
					{ ignoreRestSiblings: true, caughtErrors: 'none' },
				],
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
		},
		{
			// Code blocks inside markdown are illustrative snippets, not real components. Rules that
			// depend on lexical context (hook call sites, unused vars, undefined globals) are noise there.
			files: markdownCodeBlocks,
			rules: {
				'react-hooks/rules-of-hooks': 'off',
				'react-hooks/exhaustive-deps': 'off',
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
				// Example snippets may show lodash for illustration.
				'wpcalypso/no-import-lodash': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'jsdoc/require-param': 'off',
				'jsdoc/check-param-names': 'off',
				'@typescript-eslint/no-empty-function': 'off',
			},
		},
		{
			files: [ '**/*.json' ],
			extends: [ json.configs.recommended ],
			rules: {
				// JSON doesn't allow dangle comma or comments
				'comma-dangle': 'off',
				'json-es/no-comments': 'error',
			},
		},
		{
			// Default settings for all package.json files
			files: [ '**/package.json' ],
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
			files: [ 'config/*.json' ],
			rules: {
				'sort-keys': 'warn',
			},
		},
		{
			// These files don't have the `@automattic` prefix in the name
			files: [
				'package.json',
				'client/package.json',
				'desktop/package.json',
				'test/e2e/package.json',
				'packages/wpcom-proxy-request/package.json',
				'packages/wpcom-xhr-request/package.json',
				'packages/wpcom.js/package.json',
				'packages/eslint-plugin-wpcalypso/package.json',
				'packages/i18n-calypso-cli/package.json',
				'packages/i18n-calypso/package.json',
				'packages/i18n-utils/package.json',
				'packages/photon/package.json',
			],
			rules: {
				'@automattic/json/valid-values-name-scope': 'off',
			},
		},
		{
			// These files don't have GPL license
			files: [
				'desktop/package.json',
				'packages/agenttic-client/package.json',
				'packages/agenttic-demo/package.json',
				'packages/agenttic-ui/package.json',
				'packages/material-design-icons/package.json',
				'packages/wpcom-proxy-request/package.json',
				'packages/wpcom-xhr-request/package.json',
				'packages/wpcom.js/package.json',
			],
			rules: {
				'@automattic/json/valid-values-license': 'off',
			},
		},
		{
			// These files are "fake" package.json files, only there to configure webpack bundling
			files: [ 'client/**/package.json' ],
			ignores: [ 'client/package.json' ],
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
			files: [ '**/tsconfig.json' ],
			rules: {
				'json-es/no-comments': 'off',
			},
		},
	] );

	// Patterns stay relative to the checkout root where directory configs build on this.
	return config.map( ( entry ) => ( { ...entry, basePath: rootDir } ) );
}

// The checkout `dir` is in. Found from the config file, not from this package, which a worktree
// can resolve from another checkout's node_modules.
function findRootDir( dir ) {
	for ( let current = dir; ; current = path.dirname( current ) ) {
		const packageJson = path.join( current, 'package.json' );
		if (
			fs.existsSync( packageJson ) &&
			JSON.parse( fs.readFileSync( packageJson, 'utf8' ) ).name === 'wp-calypso'
		) {
			return current;
		}
		if ( path.dirname( current ) === current ) {
			throw new Error( `No wp-calypso checkout contains ${ dir }` );
		}
	}
}

const configs = new Map();

/**
 * The repo-wide config for the checkout containing `dir`.
 * @param {string} dir The calling config file's directory, `import.meta.dirname`.
 * @returns {import('eslint').Linter.Config[]} The config.
 */
export default function calypso( dir ) {
	const rootDir = findRootDir( dir );
	if ( ! configs.has( rootDir ) ) {
		configs.set( rootDir, build( rootDir ) );
	}
	return configs.get( rootDir );
}
