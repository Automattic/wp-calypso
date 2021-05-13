module.exports = {
	overrides: [
		{
			files: [ '**/__tests__/**/*', '**/__mocks__/**/*' ],
			rules: {
				'jest/no-mocks-import': 'off',
			},
		},
	],
};
