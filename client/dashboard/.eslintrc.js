module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							// Allowed: calypso/data/data-center
							// Allowed: calypso/data/php-versions
							'!calypso/data',
							'calypso/data/*',
							'!calypso/data/data-center',
							'!calypso/data/php-versions',
							// Allowed: calypso/lib/explat
							// Allowed: calypso/lib/interval/use-interval (temporary)
							// Allowed: calypso/lib/load-dev-helpers
							// Allowed: calypso/lib/wp
							'!calypso/lib',
							'calypso/lib/*',
							'!calypso/lib/explat',
							'!calypso/lib/interval',
							'!calypso/lib/load-dev-helpers',
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
							'!@automattic/api-core',
							'!@automattic/api-queries',
							'!@automattic/calypso-analytics',
							'!@automattic/calypso-config',
							'!@automattic/calypso-support-session',
							'!@automattic/charts',
							'!@automattic/components',
							'@automattic/components/*',
							'!@automattic/components/src',
							'@automattic/components/src/*',
							'!@automattic/components/src/circular-progress-bar',
							'!@automattic/components/src/summary-button',
							'!@automattic/components/src/breadcrumbs',
							'!@automattic/components/src/breadcrumbs/types',
							'!@automattic/components/src/logos',
							'!@automattic/domains-table',
							'!@automattic/domains-table/src/utils/*',
							'!@automattic/generate-password',
							'!@automattic/help-center',
							'!@automattic/i18n-utils',
							'!@automattic/languages',
							'!@automattic/load-script',
							'!@automattic/number-formatters',
							'!@automattic/search',
							'!@automattic/calypso-razorpay',
							'!@automattic/calypso-stripe',
							'!@automattic/composite-checkout',
							'!@automattic/shopping-cart',
							'!@automattic/ui',
							'!@automattic/urls',
							'!@automattic/viewport',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message: 'Importing from @automattic/ is not allowed in the dashboard folder.',
					},
					{
						group: [ 'lodash' ],
						message:
							'Lodash is not allowed in the dashboard folder. Use native JavaScript methods instead.',
					},
				],
				paths: [
					{
						name: '@automattic/calypso-analytics',
						message: 'Please import { useAnalytics } from client/dashboard/app/analytics instead.',
					},
					{
						name: '@automattic/components',
						message:
							'Do not import from the barrel file. Use specific imports like @automattic/components/src/summary-button instead. This prevents the entire package being bundled into the dashboard.',
					},
					{
						name: 'i18n-calypso',
						message: 'Please use the @wordpress/i18n package instead of the i18n-calypso package.',
					},
					{
						name: 'lodash',
						message: 'Please use native JavaScript instead of lodash.',
					},
					{
						name: 'moment',
						message: 'Please use date-fns instead of moment.',
					},
					{
						name: '@wordpress/components',
						importNames: [
							'Card',
							'CardBody',
							'CardDivider',
							'CardHeader',
							'CardFooter',
							'CardMedia',
						],
						message: 'Use local components exported from client/dashboard/components/card instead.',
					},
					{
						name: '@automattic/api-queries',
						importNames: [ 'sitesQuery', 'dashboardSiteListQuery', 'dashboardSiteFiltersQuery' ],
						message: 'Use local queries exported from either context or useAppContext instead.',
					},
				],
			},
		],
	},
};
