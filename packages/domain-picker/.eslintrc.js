module.exports = {
	overrides: [
		{
			files: [ '**/__test__/**/*' ],
			rules: {
				'jest/no-mocks-import': 'off',
			},
		},
	],
};
