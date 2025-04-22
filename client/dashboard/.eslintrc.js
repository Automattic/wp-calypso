module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							'!calypso/lib',
							'calypso/lib/*',
							'!calypso/lib/wp',
							'calypso/lib/wp/*',
						],
						message: 'Importing from calypso/ is not allowed in the dashboard folder.',
					},
					{
						group: [ '@automattic/*' ],
						message: 'Importing from @automattic/ is not allowed in the dashboard folder.',
					},
				],
			},
		],
	},
};
