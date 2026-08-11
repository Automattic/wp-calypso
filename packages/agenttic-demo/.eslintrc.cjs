module.exports = {
	rules: {
		'import/no-unresolved': 'off', // Disable since we use Vite aliases
		'import/no-extraneous-dependencies': 'off', // Workspace packages are available through the monorepo
	},
};
