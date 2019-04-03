module.exports = ( { options: { preserveCssCustomProperties = true } } ) => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
			preserve: preserveCssCustomProperties,
		},
		autoprefixer: {},
	},
} );
