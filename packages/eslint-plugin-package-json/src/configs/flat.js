// Flat-config version of the `recommended` preset, built from the same rule objects.
const jsonEs = require( 'eslint-plugin-json-es' );
const { parseForESLint } = require( '../parser' );
const legacy = require( './recommended' );

// ESLint identifies flat-config parsers by `meta` when caching or printing config.
const parser = {
	meta: {
		name: '@automattic/eslint-plugin-json/parser',
		version: require( '../../package.json' ).version,
	},
	parseForESLint,
};

// The plugin's rules call `context.getSourceCode()`, which ESLint 10 removed. `context.sourceCode`
// replaces it from ESLint 8.40 on. Earlier ESLint versions get the plugin itself, so configs that
// also register it still work.
const removedGetSourceCode =
	Number( require( 'eslint/package.json' ).version.split( '.' )[ 0 ] ) >= 10;
const withGetSourceCode = ( plugin ) => {
	if ( ! removedGetSourceCode ) {
		return plugin;
	}
	return {
		...plugin,
		rules: Object.fromEntries(
			Object.entries( plugin.rules ).map( ( [ name, rule ] ) => [
				name,
				{
					...rule,
					create: ( context ) =>
						rule.create(
							Object.create( context, { getSourceCode: { value: () => context.sourceCode } } )
						),
				},
			] )
		),
	};
};

// Legacy override globs without a slash match at any depth; flat ones are relative to the config.
const toFlatFiles = ( files ) =>
	files.map( ( file ) => ( file.includes( '/' ) ? file : `**/${ file }` ) );

/** @type {( plugin: import('eslint').ESLint.Plugin ) => import('eslint').Linter.Config[]} */
const recommended = ( plugin ) => [
	{
		name: '@automattic/json/recommended',
		// The JSON parser rejects flat config's defaults (`'latest'`, `'module'`); these are the legacy ones.
		languageOptions: { parser, ecmaVersion: 5, sourceType: 'script' },
		plugins: { 'json-es': withGetSourceCode( jsonEs ) },
		rules: { ...jsonEs.configs.recommended.rules, ...legacy.rules },
	},
	...legacy.overrides.map( ( { files, plugins, ...rest }, index ) => ( {
		name: `@automattic/json/recommended/overrides/${ index }`,
		files: toFlatFiles( files ),
		plugins: { '@automattic/json': plugin },
		...rest,
	} ) ),
];

module.exports = { recommended };
