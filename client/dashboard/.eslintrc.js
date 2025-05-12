module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							// Allowed: calypso/boot/locale
							'!calypso/boot',
							'calypso/boot/*',
							'!calypso/boot/locale',
							// Allowed: calypso/lib/wp
							'!calypso/lib',
							'calypso/lib/*',
							'!calypso/lib/wp',
							// Allowed: calypso/lib/i18n-utils
							'!calypso/lib/i18n-utils',
							'calypso/lib/i18n-utils/*',
							'!calypso/lib/i18n-utils/i18n',
							'!calypso/lib/i18n-utils/switch-locale',
							// Allowed: calypso/lib/user/shared-utils
							'!calypso/lib/user',
							'calypso/lib/user/*',
							'!calypso/lib/user/shared-utils',
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
							'!@automattic/components',
							'@automattic/components/*',
							'!@automattic/components/src',
							'@automattic/components/src/*',
							'!@automattic/components/src/summary-button',
							'!@automattic/components/src/core-badge',
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
