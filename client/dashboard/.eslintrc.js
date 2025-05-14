module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							// Allowed: calypso/lib/wp
							'!calypso/lib',
							'calypso/lib/*',
							'!calypso/lib/wp',
							'!calypso/components',
							'calypso/components/*',
							// Allowed: calypso/assets/icons
							'!calypso/assets',
							'calypso/assets/*',
							'!calypso/assets/icons',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message: 'Importing from calypso/ is not allowed in the dashboard folder.',
					},
					{
						group: [
							'@automattic/*',
							'!@automattic/calypso-config',
							'!@automattic/ui',
							'@automattic/ui/*',
							'!@automattic/ui/src',
							'@automattic/ui/src/*',
							'!@automattic/ui/src/summary-button',
							'!@automattic/ui/src/badge',
							'!@automattic/dataviews',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message: 'Importing from @automattic/ is not allowed in the dashboard folder.',
					},
				],
			},
		],
	},
};
