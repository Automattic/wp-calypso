module.exports = () => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
			preserve: true,
		},
		autoprefixer: {},
	},
} );
