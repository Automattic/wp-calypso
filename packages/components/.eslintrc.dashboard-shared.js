module.exports = {
	rules: {
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: [
							'calypso/*',
							// Allowed: calypso/assets/icons
							// Allowed: calypso/assets/images
							'!calypso/assets',
							'calypso/assets/*',
							'!calypso/assets/icons',
							'!calypso/assets/images',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message:
							'Importing from calypso/ is not allowed for components shared with client/dashboard.',
					},
					{
						group: [
							'@automattic/*',
							'!@automattic/calypso-config',
							'!@automattic/components',
							'!@automattic/number-formatters',
							'!@automattic/ui',
							'!@automattic/viewport',
							// Please do not add exceptions unless agreed on
							// with the #architecture group.
						],
						message:
							'Importing from @automattic/ is not allowed for components shared with client/dashboard.',
					},
				],
			},
		],
	},
};
