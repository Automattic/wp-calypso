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
			'@emotion/styled': path.join( process.cwd(), 'node_modules/@emotion/styled' ),
			'@emotion/core': path.join( process.cwd(), 'node_modules/@emotion/react' ),
			'@emotion-theming': path.join( process.cwd(), 'node_modules/@emotion/react' ),
			'@emotion/react': path.join( process.cwd(), 'node_modules/@emotion/react' ),
		};
		return config;
	},
};
