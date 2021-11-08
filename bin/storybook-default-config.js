const { dirname } = require( 'path' );

// Using `require.resolve` by itself gives a path to a file in /dist. Instead,
// resolve `/package.json` and then get the containing directory to find the root
// of the given module.
const findModule = ( module ) => dirname( require.resolve( module + '/package.json' ) );

module.exports = function storybookDefaultConfig( {
	stories,
	plugins = [],
	webpackAliases = {},
} = {} ) {
	return {
		core: {
			builder: 'webpack5',
		},
		stories: stories && stories.length ? stories : [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
		addons: [ '@storybook/addon-actions', '@storybook/preset-scss' ],
		typescript: {
			check: false,
			reactDocgen: false,
		},
		babel: {
			presets: [
				[ '@babel/preset-env', { targets: { browsers: 'last 2 versions' } } ],
				[ '@babel/preset-react', { runtime: 'automatic' } ],
			],
			plugins: [ [ '@babel/plugin-proposal-private-property-in-object', { loose: false } ] ],
		},
		webpackFinal: async ( config ) => {
			config.resolve.alias = {
				...config.resolve.alias,
				/**
				 * Storybook manually resolves emotion 10 internally. To render
				 * a package using Emotion 11, we must manually alias Emotion
				 * imports to use the v11 packages instead of v10.
				 *
				 * @todo Remove once Storybook supports Emotion 11.
				 * @see https://github.com/storybookjs/storybook/issues/12262
				 * @see https://github.com/storybookjs/storybook/pull/13300#issuecomment-783268111
				 */
				'@emotion/styled': findModule( '@emotion/styled' ),
				'@emotion/core': findModule( '@emotion/react' ),
				'@emotion-theming': findModule( '@emotion/react' ),
				'@emotion/react': findModule( '@emotion/react' ),
				...webpackAliases,
			};
			config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
			config.plugins.push( ...plugins );
			return config;
		},
	};
};
