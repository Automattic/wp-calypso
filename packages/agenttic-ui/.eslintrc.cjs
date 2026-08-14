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
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: [ './tsconfig.json' ],
	},
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
			files: [ '**/*.stories.*', '**/stories/**', '**/__stories__/**' ],
			rules: {
				'no-console': 'off',
			},
		},
		{
			// scripts/ are Node CLI tools, not browser code
			files: [ 'scripts/**' ],
			rules: {
				'import/no-nodejs-modules': 'off',
			},
		},
		{
			// Package-root config files are not covered by tsconfig.json,
			// so type-aware parsing cannot apply to them.
			files: [ '*.config.ts' ],
			parserOptions: {
				project: null,
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
			// Markdown code fences are linted as virtual `<name>.md.<lang>` files.
			// They are illustrative snippets outside tsconfig.json; re-relax the
			// rules the root config already turns off for them, which the TS
			// overrides above would otherwise re-enable.
			files: [ '**/*.md.{js,javascript,cjs,ejs,jsx,ts,tsx}' ],
			parserOptions: {
				project: null,
			},
			rules: {
				'react-hooks/rules-of-hooks': 'off',
				'react-hooks/exhaustive-deps': 'off',
				'no-unused-vars': 'off',
				'no-undef': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'import/no-extraneous-dependencies': 'off',
				'react/jsx-no-undef': 'off',
			},
		},
		{
			// The wp preset's top-level @babel parser would otherwise hijack
			// markdown files from the root config's markdown parser, and this
			// config's prettier/prettier options would clobber the markdown
			// parser that plugin:md/prettier sets for them.
			files: [ '**/*.md' ],
			parser: 'markdown-eslint-parser',
			rules: {
				'prettier/prettier': [ 'warn', { parser: 'markdown' } ],
			},
		},
	],
};
