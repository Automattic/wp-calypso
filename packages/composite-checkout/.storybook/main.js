const path = require( 'path' );
const TranspileConfig = require( '@automattic/calypso-build/webpack/transpile' );

module.exports = {
	stories: [ '../demo/*.js' ],
	addons: [ '@storybook/addon-actions', '@storybook/preset-scss' ],
	typescript: {
		check: false,
		reactDocgen: false,
	},
	webpackFinal: async ( config, { configType } ) => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@automattic/composite-checkout': path.join( __dirname, '../src/public-api.ts' ),
			// Storybook does not support Emotion 11, so resolve it manually.
			// TODO: Remove once Storybook supports Emotion 11.
			'@emotion/styled': require.resolve( '@emotion/styled' ),
			'@emotion/core': require.resolve( '@emotion/react' ),
			'@emotion-theming': require.resolve( '@emotion/react' ),
			'@emotion/react': require.resolve( '@emotion/react' ),
		};
		config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
		return config;
	},
};
