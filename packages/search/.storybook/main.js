const path = require( 'path' );

module.exports = {
	stories: [ '../src/*.stories.{js,jsx,ts,tsx}' ],
	addons: [ '@storybook/addon-actions', '@storybook/preset-scss' ],
	typescript: {
		check: false,
		reactDocgen: false,
	},
	webpackFinal: async ( config, { configType } ) => {
		config.resolve.alias = {
			...config.resolve.alias,
			// Storybook does not support Emotion 11, so resolve it manually.
			// TODO: Remove once Storybook supports Emotion 11.
			'@emotion/styled': require.resolve( '@emotion/styled' ),
			'@emotion/core': require.resolve( '@emotion/react' ),
			'@emotion-theming': require.resolve( '@emotion/react' ),
			'@emotion/react': require.resolve( '@emotion/react' ),
		};
		return config;
	},
};
