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
				debug: opts.debug ? opts.debug : false,
				modules: modulesOption( opts ),
			},
		],
		[
			require.resolve( '@babel/preset-typescript' ),
			// Babel 8 defaults this to true, which keeps imports used only as types unless written as
			// `import type`; their modules may have no runtime exports at all.
			{ onlyRemoveTypeImports: false },
		],
	],
	// JSX syntax only for files that can contain it: in a .ts file, `<T>value` assertions and generic
	// arrows (`<T>( x ) =>`) would parse as JSX. Babel 7's TypeScript plugin turned JSX off for .ts
	// itself; Babel 8's doesn't, and preset-react turns it on.
	overrides: [
		{
			exclude: /\.ts$/,
			presets: [
				[
					require.resolve( '@babel/preset-react' ),
					{
						runtime: 'automatic',
						// Babel 8 turns this on in development builds, importing `react/jsx-dev-runtime`, which WordPress
						// doesn't provide to the apps that take React from it.
						development: false,
						importSource: opts.importSource ?? process.env.IMPORT_SOURCE,
					},
				],
			],
		},
	],
	plugins: [
		[
			require.resolve( '@babel/plugin-transform-runtime' ),
			{
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
