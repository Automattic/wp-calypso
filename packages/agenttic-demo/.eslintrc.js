module.exports = {
	extends: [ '../.eslintrc.yaml' ],
	rules: {
		'import/no-unresolved': 'off', // Disable since we use Vite aliases
		'import/no-extraneous-dependencies': 'off', // Workspace packages are available through pnpm
	},
};
