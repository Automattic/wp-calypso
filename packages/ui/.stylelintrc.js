module.exports = {
	extends: [ '../../.stylelintrc' ],
	plugins: [ 'stylelint-plugin-logical-css' ],
	rules: {
		'declaration-property-max-values': {
			// Prevents left/right values with shorthand property names (unclear for RTL)
			margin: 3,
			padding: 3,
			'border-width': 3,
			'border-color': 3,
			'border-style': 3,
			'border-radius': 3,
			inset: 3,
		},
		'plugin/use-logical-properties-and-values': [
			true,
			{
				ignore: [
					// Doesn't affect RTL styles
					'width',
					'min-width',
					'max-width',
					'height',
					'min-height',
					'max-height',
					'margin-top',
					'margin-bottom',
					'padding-top',
					'padding-bottom',
					'top',
					'bottom',
				],
			},
		],
	},
};
