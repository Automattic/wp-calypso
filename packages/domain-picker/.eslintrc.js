module.exports = {
	overrides: [
		{
			files: [ '**/__tests__/**/*' ],
			rules: {
				'jest/no-mocks-import': 'off',
			},
		},
	],
};
