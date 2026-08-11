// Upstream this extended `../.eslintrc.yaml`, the agenttic repo root config, which did not travel
// with the move and would now resolve to a nonexistent `packages/.eslintrc.yaml`.
module.exports = {
	rules: {
		// Formatted with stock prettier, not Calypso's wp-prettier. See AGENTS.md.
		'prettier/prettier': 'off',
		'import/order': 'off',
		'import/no-unresolved': 'off', // Vite aliases
		'import/no-extraneous-dependencies': 'off',
		'no-console': 'off',
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
};
