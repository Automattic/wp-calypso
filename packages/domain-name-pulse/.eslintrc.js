module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [ 'client/**/*', 'calypso/**/*' ],
						message: 'Calypso imports are not allowed in this package',
					},
				],
			},
		],
	},
};
