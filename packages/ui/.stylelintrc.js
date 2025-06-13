module.exports = {
	extends: [ '../../.stylelintrc' ],
	plugins: [ 'stylelint-plugin-logical-css' ],
	rules: {
		'declaration-property-max-values': {
			// Prevents shorthand left/right values (unclear for RTL)
			margin: 3,
			padding: 3,
		},
		'plugin/use-logical-properties-and-values': [
			true,
			{
				ignore: [ 'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height' ],
			},
		],
	},
};
