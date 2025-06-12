module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							// Allowed: calypso/data/php-versions
							'!calypso/data',
							'calypso/data/*',
							'!calypso/data/php-versions',
							// Allowed: calypso/data/data-center
							'!calypso/data/data-center',
							// Allowed: calypso/lib/wp
							'!calypso/lib',
							'calypso/lib/*',
							'!calypso/lib/wp',
							// Allowed: calypso/assets/icons
							// Allowed: calypso/assets/images
							'!calypso/assets',
							'calypso/assets/*',
							'!calypso/assets/icons',
							'!calypso/assets/images',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message: 'Importing from calypso/ is not allowed in the dashboard folder.',
					},
					{
						group: [
							'@automattic/*',
							'!@automattic/calypso-config',
							'!@automattic/components',
							'@automattic/components/*',
							'!@automattic/components/src',
							'@automattic/components/src/*',
							'!@automattic/components/src/summary-button',
							'!@automattic/components/src/core-badge',
							'!@automattic/components/src/breadcrumbs',
							'!@automattic/components/src/breadcrumbs/types',
							'!@automattic/calypso-analytics',
							'!@automattic/dataviews',
							'!@automattic/number-formatters',
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
