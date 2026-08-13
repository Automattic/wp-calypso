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
	rules: {
		'import/no-unresolved': 'off', // Disable since we use Vite aliases
		'import/no-extraneous-dependencies': 'off', // Workspace packages resolve via aliases
		'prettier/prettier': [ 'error', prettierOptions ],
		// The moved sources predate Calypso's import/order convention; reordering imports
		// across the tree would conflict with every in-flight agenttic branch. Follow-up.
		'import/order': 'off',
	},
};
