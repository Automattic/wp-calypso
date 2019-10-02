module.exports = ( {
	options: { preserveCssCustomProperties = true, importCssCustomPropertiesFrom },
} ) => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: importCssCustomPropertiesFrom,
			preserve: preserveCssCustomProperties,
		},
		autoprefixer: {},
	},
} );
