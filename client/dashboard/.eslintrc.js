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
							// Allowed: calypso/lib/load-dev-helpers
							'!calypso/lib/load-dev-helpers',
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
							'!@automattic/calypso-support-session',
							'!@automattic/components',
							'@automattic/components/*',
							'!@automattic/components/src',
							'@automattic/components/src/*',
							'!@automattic/api-core',
							'!@automattic/api-queries',
							'!@automattic/components/src/circular-progress-bar',
							'!@automattic/components/src/summary-button',
							'!@automattic/components/src/breadcrumbs',
							'!@automattic/components/src/breadcrumbs/types',
							'!@automattic/components/src/logos',
							'!@automattic/calypso-analytics',
							'!@automattic/domains-table',
							'!@automattic/domains-table/src/utils/*',
							'!@automattic/generate-password',
							'!@automattic/help-center',
							'!@automattic/i18n-utils',
							'!@automattic/number-formatters',
							'!@automattic/ui',
							'!@automattic/urls',
							'!@automattic/viewport',
							'!@automattic/languages',
							'!@automattic/charts',
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
				],
			},
		],
	},
};
