const config = {
	presets: [
		[
			'@babel/env',
			{
				targets: { browsers: [ 'last 2 versions', 'Safari >= 10', 'iOS >= 10', 'ie >= 11' ] },
				useBuiltIns: 'entry',
				// allows es7 features like Promise.prototype.finally
				shippedProposals: true,
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
		'@babel/react',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-export-default-from',
		'@babel/plugin-proposal-export-namespace-from',
		'@babel/plugin-syntax-dynamic-import',
		[
			'@babel/transform-runtime',
			{
				corejs: false, // we polyfill so we don't need core-js
				helpers: true,
				regenerator: false,
				useESModules: false,
			},
		],
	],
	overrides: [
		{
			test: './src',
			plugins: [
				[
					'@wordpress/import-jsx-pragma',
					{
						scopeVariable: 'createElement',
						source: '@wordpress/element',
						isDefault: false,
					},
				],
				[
					'@babel/transform-react-jsx',
					{
						pragma: 'createElement',
					},
				],
			],
		},
	],
	env: {
		test: {
			presets: [ [ '@babel/env', { targets: { node: 'current' } } ] ],
			plugins: [ 'add-module-exports', 'babel-plugin-dynamic-import-node' ],
		},
	},
};

module.exports = config;
