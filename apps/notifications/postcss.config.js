module.exports = () => ( {
	plugins: {
		'postcss-custom-properties': {
			importFrom: [
				require.resolve( '@automattic/calypso-color-schemes/js' ),
				// The WordPress.com admin theme color. The src/app note-list
				// hover/unread styles read these (e.g.
				// `rgba(var(--wp-admin-theme-color--rgb), …)`); calypso hosts
				// (e.g. client/dashboard/app-dotcom) define them in :root, but
				// the standalone iframe has no such host, so resolve them here.
				{
					customProperties: {
						'--wp-admin-theme-color': '#3858e9',
						'--wp-admin-theme-color--rgb': '56, 88, 233',
						'--wp-admin-theme-color-darker-10': '#2145e6',
						'--wp-admin-theme-color-darker-10--rgb': '33, 69, 230',
						'--wp-admin-theme-color-darker-20': '#183ad6',
						'--wp-admin-theme-color-darker-20--rgb': '24, 58, 214',
						'--wp-admin-border-width-focus': '2px',
					},
				},
			],
			// @TODO: Drop `preserve: false` workaround if possible
			// See https://github.com/Automattic/jetpack/pull/13854#issuecomment-550898168
			preserve: false,
		},
		autoprefixer: {},
	},
} );
