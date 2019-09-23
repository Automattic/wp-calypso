// @babel/preset-env modules option. `false` for ECMAScript modules.
let modules = 'commonjs'; // Default
if ( typeof process.env.MODULES !== 'undefined' ) {
	modules = process.env.MODULES === 'esm' ? false : process.env.MODULES;
}

module.exports = () => ( {
	presets: [
		[
			require.resolve( '@babel/preset-env' ),
			{
				corejs: 2,
				modules,
				useBuiltIns: 'entry',
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
		require.resolve( '@babel/preset-react' ),
		require.resolve( '@babel/preset-typescript' ),
	],
	plugins: [
		require.resolve( '@babel/plugin-proposal-class-properties' ),
		require.resolve( '@babel/plugin-syntax-dynamic-import' ),
		[
			require.resolve( '@babel/plugin-transform-runtime' ),
			{
				corejs: false, // we polyfill so we don't need core-js
				helpers: true,
				regenerator: false,
				useESModules: false,
				// Needed so that helpers aren't duplicated.
				// This will need to be kept up to date while https://github.com/babel/babel/issues/10261 is unresolved.
				version: '7.5.5',
			},
		],
	],
} );
