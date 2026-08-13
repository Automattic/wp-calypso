// On @wordpress/eslint-plugin v25, `extends: 'plugin:@wordpress/eslint-plugin/recommended'`
// resolves to a flat config, which crashes under ESLINT_USE_FLAT_CONFIG=false.
// Use the legacy eslintrc subpath instead, like Calypso's root .eslintrc.js does.
const wpRecommended = require( '@wordpress/eslint-plugin/eslintrc' ).configs.recommended;

// Calypso's root config passes its own formatting options (tabWidth 2, printWidth 100) to
// prettier/prettier, which take precedence over .prettierrc. Restate this package's
// .prettierrc values so the rule agrees with what the pre-commit hook's prettier writes.
const prettierOptions = {
	useTabs: true,
	tabWidth: 4,
	printWidth: 80,
	singleQuote: true,
	bracketSpacing: true,
	parenSpacing: true,
	bracketSameLine: false,
	semi: true,
	arrowParens: 'always',
	trailingComma: 'es5',
};

module.exports = {
	...wpRecommended,
	rules: {
		...wpRecommended.rules,
		'@wordpress/i18n-text-domain': [
			'error',
			{
				allowedTextDomain: 'a8c-agenttic',
			},
		],
		'prettier/prettier': [ 'error', prettierOptions ],
		// The moved sources predate Calypso's import/order convention; reordering imports
		// across the tree would conflict with every in-flight agenttic branch. Follow-up.
		'import/order': 'off',
		// Debt: bare @ts-ignore came in with the move; documenting them needs the
		// original authors. Follow-up.
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{ 'ts-ignore': false, 'ts-expect-error': false },
		],
		// Debt: parity with the source repo's config; not Calypso's standard. Follow-up.
		'no-console': 'off',
	},
	overrides: [
		...( wpRecommended.overrides || [] ),
		{
			// The wp config's top-level @babel/eslint-parser would otherwise hijack
			// JSON files from Calypso's JSON linting setup.
			files: [ '**/*.json' ],
			extends: [ 'plugin:@automattic/json/recommended' ],
		},
		{
			// *.test.ts is excluded from tsconfig.json, so type-aware parsing
			// cannot apply to test files.
			files: [ '**/*.ts', '**/*.tsx' ],
			excludedFiles: [ '**/*.test.ts' ],
			parserOptions: {
				tsconfigRootDir: __dirname,
				project: [ './tsconfig.json' ],
			},
		},
		{
			// Late override: the wp config's own TS override sets this rule, and
			// overrides outrank top-level rules.
			files: [ '**/*.ts', '**/*.tsx' ],
			rules: {
				'@typescript-eslint/no-unused-vars': [
					'error',
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
						caughtErrorsIgnorePattern: '^_',
						ignoreRestSiblings: true,
					},
				],
			},
		},
		{
			files: [
				'**/*.stories.*',
				'**/stories/**',
				'**/__stories__/**',
				'**/*.ts*',
			],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
