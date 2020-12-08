const path = require( 'path' );

module.exports = {
	stories: [ '../src/*.stories.{js,jsx,ts,tsx}' ],
	addons: [
		'@storybook/addon-actions',
		'@storybook/preset-scss',
		{
			name: '@storybook/preset-typescript',
			options: {
				tsLoaderOptions: {
					transpileOnly: true,
					configFile: path.resolve( __dirname, '../tsconfig.json' ),
				},
				tsDocgenLoaderOptions: {
					tsconfigPath: path.resolve( __dirname, '../tsconfig.json' ),
				},
				forkTsCheckerWebpackPluginOptions: {
					tsconfig: path.resolve( __dirname, '../tsconfig.json' ),
					memoryLimit: 4096,
				},
				include: [ path.resolve( __dirname, '../src' ) ],
			},
		},
	],
};
