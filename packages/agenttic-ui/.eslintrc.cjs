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
	},
	overrides: [
		...( wpRecommended.overrides || [] ),
		{
			files: [ '**/*.stories.*', '**/stories/**', '**/__stories__/**' ],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
