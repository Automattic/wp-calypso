const path = require( 'path' );
const calypsoBabelConfig = require( '@automattic/calypso-babel-config' );

module.exports = function storybookDefaultConfig( {
	staticDirs = [],
	stories,
	plugins = [],
	webpackAliases = {},
	babelCacheDirectory = path.join( __dirname, '../../../.cache/babel-storybook' ),
} = {} ) {
	return {
		framework: {
			name: '@storybook/react-webpack5',
			options: { fastRefresh: true, builder: { lazyCompilation: true } },
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
						require.resolve( '@babel/plugin-transform-private-property-in-object' ),
						{ loose: true },
					],
					[ require.resolve( '@babel/plugin-proposal-class-properties' ), { loose: true } ],
					[ require.resolve( '@babel/plugin-transform-private-methods' ), { loose: true } ],
				],
			};
		},
		staticDirs,
		stories: stories && stories.length ? stories : [ '../src/**/*.stories.{js,jsx,ts,tsx}' ],
		addons: [
			'@storybook/addon-controls',
			'@storybook/addon-actions',
			'@storybook/addon-docs',
			'@storybook/addon-toolbars',
			'@storybook/addon-viewport',
			'@storybook/addon-themes',
			'@storybook/addon-webpack5-compiler-babel',
		],
		typescript: {
			check: false,
			reactDocgen: 'react-docgen-typescript',
		},
		webpackFinal: async ( config ) => {
			config.resolve.alias = {
				...config.resolve.alias,
				...webpackAliases,
			};
			config.module.rules = [
				...config.module.rules,
				{
					test: /\.scss$/,
					use: [
						'style-loader', // Injects styles into the DOM
						'css-loader', // Translates CSS into CommonJS
						'sass-loader', // Compiles Sass to CSS
					],
				},
			];
			config.resolve.mainFields = [ 'browser', 'calypso:src', 'module', 'main' ];
			config.plugins.push( ...plugins );
			return config;
		},
	};
};
