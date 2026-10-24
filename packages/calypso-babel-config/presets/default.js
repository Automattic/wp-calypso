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
				// Exclude `web.immediate`: the non-standard setImmediate is unused and needed by no target browser.
				exclude: [ 'transform-typeof-symbol', 'web.immediate' ],
			},
		],
		[ require.resolve( '@babel/preset-typescript' ), { allowDeclareFields: true } ],
	],
	// JSX syntax only for files that can contain it: in a .ts file, `<T>value` assertions and generic
	// arrows (`<T>( x ) =>`) would parse as JSX. Babel 7's TypeScript plugin turned JSX off for .ts
	// itself; Babel 8's doesn't, and preset-react and the Emotion plugin both turn it on.
	overrides: [
		{
			exclude: /\.ts$/,
			presets: [
				[
					require.resolve( '@babel/preset-react' ),
					{
						runtime: 'automatic',
						importSource: opts.importSource ?? process.env.IMPORT_SOURCE,
					},
				],
			],
			plugins: [ require.resolve( '@emotion/babel-plugin' ) ],
		},
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
		// preset-react's `/*#__PURE__*/` marking for React calls, kept for .ts files too.
		require.resolve( '@babel/plugin-transform-react-pure-annotations' ),
	],
} );
