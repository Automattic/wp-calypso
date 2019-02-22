module.exports = ( { options: { preserveCssCustomProperties = true } } ) => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-css-custom-properties' ) ],
			preserve: preserveCssCustomProperties,
		},
		autoprefixer: {},
	},
} );
