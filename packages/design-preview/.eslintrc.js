module.exports = {
	overrides: [
		{
			files: [ '**/__tests__/**/*' ],
			rules: {
				'jest/no-mocks-import': 'off',
			},
		},
		{
			files: [ '**/*.js' ],
			rules: {
				'wpcalypso/no-unsafe-wp-apis': [
					'warn',
					{
						'@wordpress/block-editor': [ '__unstableIframe', '__unstableEditorStyles' ],
						'@wordpress/components': [
							'__unstableMotion',
							'__experimentalHStack',
							'__experimentalVStack',
						],
					},
				],
			},
		},
	],
};
