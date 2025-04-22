module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [ 'calypso/*', '!calypso/lib' ],
						message: 'Importing from calypso/ is not allowed in the dashboard folder.',
					},
				],
			},
		],
	},
};
