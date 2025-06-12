const storybookDefaultConfig = require( '@automattic/calypso-storybook' );
const path = require( 'path' );

const config = {
	...storybookDefaultConfig(),
	stories: [
		'../src/**/*.stories.@(js|jsx|ts|tsx)',
		'../src/**/*.story.@(js|jsx|ts|tsx)',
	],
	webpackFinal: async ( config ) => {
		// Get the default config
		const defaultConfig =
			await storybookDefaultConfig().webpackFinal( config );

		// Override sideEffects for style files
		defaultConfig.module.rules.push( {
			test: /\.(scss|css)$/,
			sideEffects: true,
		} );

		return defaultConfig;
	},
};

module.exports = config;
