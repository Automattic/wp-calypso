module.exports = ( api ) => {
	api.cache( false );

	return {
		presets: [
			[
				require.resolve( '@babel/preset-env' ),
				{
					corejs: 3.6,
					debug: false,
					bugfixes: false,
					modules: false,
					useBuiltIns: 'entry',
					// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
					exclude: [ 'transform-typeof-symbol' ],
				},
			],
			[
				require.resolve( '@babel/preset-react' ),
				{ runtime: 'automatic', importSource: 'preact/compat' },
			],
			require.resolve( '@babel/preset-typescript' ),
		],
		plugins: [
			require.resolve( '@babel/plugin-proposal-class-properties' ),
			[
				require.resolve( '@babel/plugin-transform-runtime' ),
				{
					corejs: false, // we polyfill so we don't need core-js
					helpers: true,
					regenerator: false,
					useESModules: false,
					// Needed so that helpers aren't duplicated.
					// This will need to be kept up to date while https://github.com/babel/babel/issues/10261 is unresolved.
					version: require( '@babel/helpers/package.json' ).version,
				},
			],
			require.resolve( '@automattic/babel-plugin-preserve-i18n' ),
		],
	};
};
