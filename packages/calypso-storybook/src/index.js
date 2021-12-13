const path = require( 'path' );
const calypsoBabelConfig = require( '@automattic/calypso-babel-config' );

module.exports = function storybookDefaultConfig( {
	stories,
	plugins = [],
	webpackAliases = {},
	babelCacheDirectory = path.join( __dirname, '../../../.cache/babel-storybook' ),
} = {} ) {
	return {
		core: {
			builder: 'webpack5',
		},
		features: {
			/**
			 * Can probably be removed after the next major storybook release with emotion 11 support.
			 *
			 * @see https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#emotion11-quasi-compatibility
			 */
			emotionAlias: false,
			babelModeV7: true,
		},

		babel: async ( storybookConfig ) => {
			const baseConfig = calypsoBabelConfig();
			return {
				...storybookConfig,
				cacheDirectory: babelCacheDirectory,

				// Reuse presets and plugins from the base Calypso config
				presets: [ ...( storybookConfig.presets ?? [] ), ...( baseConfig.presets ?? [] ) ],
				plugins: [
					...( storybookConfig.plugins ?? [] ),
					...( baseConfig.plugins ?? [] ),

					// Forces some plugins to load in loose mode, used by Storybook.
					// See https://github.com/storybookjs/storybook/issues/14805
					[
						require.resolve( '@babel/plugin-proposal-private-property-in-object' ),
						{ loose: true },
					],
					[ require.resolve( '@babel/plugin-proposal-class-properties' ), { loose: true } ],
					[ require.resolve( '@babel/plugin-proposal-private-methods' ), { loose: true } ],
				],
			};
		},

		stories: stories && stories.length ? stories : [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
		addons: [ '@storybook/addon-actions', '@storybook/preset-scss' ],
		typescript: {
			check: false,
			reactDocgen: false,
		},
		webpackFinal: async ( config ) => {
			config.resolve.alias = {
				...config.resolve.alias,
				...webpackAliases,
			};
			config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
			config.plugins.push( ...plugins );
			return config;
		},
	};
};
