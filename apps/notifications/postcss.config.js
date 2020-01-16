module.exports = () => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes' ) ],
			// @TODO: Drop `preserve: false` workaround if possible
			// See https://github.com/Automattic/jetpack/pull/13854#issuecomment-550898168
			preserve: false,
		},
		autoprefixer: {},
	},
} );
