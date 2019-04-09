module.exports = {
	extends: require.resolve( '@automattic/calypso-build/babel.config.js' ),
	presets: [ require( '@automattic/calypso-build/babel/wordpress-element' ) ],
	env: {
		build_pot: {
			plugins: [ '@wordpress/babel-plugin-makepot' ],
		},
	},
};
