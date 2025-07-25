module.exports = {
	extends: [ '../.eslintrc.yaml' ],
	rules: {
		'import/no-unresolved': 'off', // Disable since we use Vite aliases
	},
};
