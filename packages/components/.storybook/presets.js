const path = require( 'path' );

module.exports = [
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
			forkTsCheckerWebpackPluginOptions: {},
			include: [ path.resolve( __dirname, '../src' ) ],
		},
	},
];
