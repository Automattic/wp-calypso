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
		};
		config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
		return config;
	},
};
