module.exports = function storybookDefaultConfig( {
	stories,
	plugins = [],
	webpackAliases = {},
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
