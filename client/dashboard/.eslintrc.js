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
							// Allowed:
							// - calypso/components/core/badge
							// - calypso/components/wordpress-logo
							'!calypso/components',
							'calypso/components/*',
							'!calypso/components/wordpress-logo',
							'!calypso/components/core',
							'calypso/components/core/*',
							'!calypso/components/core/badge',
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
							// Allowed:
							// - @automattic/components/src/summary-button
							'!@automattic/components',
							'@automattic/components/*',
							'!@automattic/components/src',
							'@automattic/components/src/*',
							'!@automattic/components/src/summary-button',
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
