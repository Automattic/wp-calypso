module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [ 'calypso/*' ],
						message:
							'Importing from calypso/ is not allowed in the dashboard folder. Please use relative imports or appropriate package imports instead.',
					},
				],
			},
		],
	},
};
