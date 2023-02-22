module.exports = {
	overrides: [
		{
			files: [ '**/*.{js.jsx,ts,tsx}' ],
			rules: {
				'wpcalypso/no-unsafe-wp-apis': [
					'error',
					{
						'@wordpress/block-editor': [ '__unstableIframe', '__unstableEditorStyles' ],
						'@wordpress/components': [ '__experimentalHStack', '__experimentalVStack' ],
					},
				],
			},
		},
	],
};
