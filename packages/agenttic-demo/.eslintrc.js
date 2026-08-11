// Upstream this extended `../.eslintrc.yaml` — the agenttic repo root config,
// which did not travel with the move and would now resolve to a nonexistent
// `packages/.eslintrc.yaml`. Calypso's root config takes its place.
//
// `prettier/prettier` and `import/order` are off for the same reason as in the
// two published packages: this code was formatted with stock prettier, not
// wp-prettier. Deferred to a follow-up.
module.exports = {
	rules: {
		'prettier/prettier': 'off',
		'import/order': 'off',
		'import/no-unresolved': 'off', // Vite aliases
		'import/no-extraneous-dependencies': 'off',
		'no-console': 'off',
	},
};
