module.exports = {
	overrides: [
		{
			files: [ '**/__tests__/**/*' ],
			rules: {
				'jest/no-mocks-import': 'off',
			},
		},
		{
			files: [ '**/*.{js.jsx,ts,tsx}' ],
			rules: {
				'wpcalypso/no-unsafe-wp-apis': [
					'error',
					{
						'@wordpress/block-editor': [ '__unstableIframe', '__unstableEditorStyles' ],
					},
				],
			},
		},
	],
};
