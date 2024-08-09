module.exports = {
	extends: [],
	plugins: [ 'jest' ],
	env: {
		jest: true,
	},
	rules: {
		// Disable the `jest/no-conditional-expect` rule
		'jest/no-conditional-expect': 'off',
	},
};
