const { dirname } = require( 'path' );

// require.resolve returns a path to a file in /dist. To get to the root of the
// package, we need to go up the directory tree twice.
const toPath = ( module ) => dirname( dirname( require.resolve( module ) ) );

module.exports = function storybookDefaultConfig( { stories, webpackAliases = {} } = {} ) {
	return {
		stories: stories && stories.length ? stories : [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
		addons: [ '@storybook/addon-actions', '@storybook/preset-scss' ],
		typescript: {
			check: false,
			reactDocgen: false,
		},
		babel: {
			presets: [
				[ '@babel/preset-env', { targets: { browsers: 'last 2 versions' } } ],
				[ '@babel/preset-react' ],
			],
			plugins: [ [ '@babel/plugin-proposal-private-property-in-object', { loose: false } ] ],
		},
		webpackFinal: async ( config ) => {
			config.resolve.alias = {
				...config.resolve.alias,
				// Storybook does not support Emotion 11, so resolve it manually.
				// TODO: Remove once Storybook supports Emotion 11.
				'@emotion/styled': toPath( '@emotion/styled' ),
				'@emotion/core': toPath( '@emotion/react' ),
				'@emotion-theming': toPath( '@emotion/react' ),
				'@emotion/react': toPath( '@emotion/react' ),
				...webpackAliases,
			};
			config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
			return config;
		},
	};
};
