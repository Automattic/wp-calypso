const path = require( 'path' );

module.exports = {
	babel: {
		presets: [
			[ '@babel/preset-env', { loose: true, targets: { node: 'current' } } ],
			[ '@babel/preset-react' ],
		],
		plugins: [
			[ '@babel/plugin-proposal-class-properties', { loose: true } ],
			[ '@babel/plugin-proposal-private-methods', { loose: true } ],
			[ '@babel/plugin-proposal-private-property-in-object', { loose: true } ],
		],
	},
	stories: [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
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
