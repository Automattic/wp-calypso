// @babel/preset-env modules option. `false` for ECMAScript modules.
function modulesOption( opts ) {
	if ( opts && opts.modules !== undefined ) {
		return opts.modules;
	}

	if ( typeof process.env.MODULES !== 'undefined' ) {
		return process.env.MODULES === 'esm' ? false : process.env.MODULES;
	}

	return false; // Default
}

module.exports = ( api, opts ) => ( {
	presets: [
		[
			require.resolve( '@babel/preset-env' ),
			{
				corejs: opts.corejs ? opts.corejs : 3.6,
				debug: opts.debug ? opts.debug : false,
				bugfixes: opts.bugfixes ? opts.bugfixes : false,
				modules: modulesOption( opts ),
				useBuiltIns: opts.useBuiltIns ? opts.useBuiltIns : 'entry',
				// Exclude transforms that make all code slower, see https://github.com/facebook/create-react-app/pull/5278
				exclude: [ 'transform-typeof-symbol' ],
			},
		],
		[
			require.resolve( '@babel/preset-react' ),
			{
				runtime: 'automatic',
				importSource: opts.importSource ?? process.env.IMPORT_SOURCE,
			},
		],
		[ require.resolve( '@babel/preset-typescript' ), { allowDeclareFields: true } ],
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
		require.resolve( '@emotion/babel-plugin' ),
	],
} );
