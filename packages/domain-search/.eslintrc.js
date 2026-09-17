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
					{
						group: [ '**/name-pulse/*', '**/name-pulse/**/*' ],
						message: 'Import Name Pulse only through its index (…/name-pulse), not deep paths.',
					},
				],
			},
		],
	},
};
