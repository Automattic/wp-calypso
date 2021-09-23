module.exports = () => ( {
	plugins: {
		// In theory we don't need to resolve custom properties, as all supported browsers understand CSS variables.
		// However that would require for Notifications to import @automattic/calypso-color-schemes styles, and they
		// come with useless bloat for Notifications (namely color schemes).
		'postcss-custom-properties': {
			importFrom: [ require.resolve( '@automattic/calypso-color-schemes/json' ) ],
			// @TODO: Drop `preserve: false` workaround if possible
			// See https://github.com/Automattic/jetpack/pull/13854#issuecomment-550898168
			preserve: false,
		},
		autoprefixer: {},
	},
} );
