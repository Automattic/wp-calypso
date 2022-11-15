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
					1,
					{
						'@wordpress/block-editor': [
							'__unstableIframe',
							'__unstableEditorStyles',
							'__unstablePresetDuotoneFilter',
						],
					},
				],
			},
		},
	],
};
