// The `recommended` preset, built from the rules `recommended.js` holds.
const jsonEs = require( 'eslint-plugin-json-es' );
const { parseForESLint } = require( '../parser' );
const recommendedRules = require( './recommended' );

// ESLint identifies parsers by `meta` when caching or printing config.
const parser = {
	meta: {
		name: '@automattic/eslint-plugin-json/parser',
		version: require( '../../package.json' ).version,
	},
	parseForESLint,
};

// The plugin's rules call `context.getSourceCode()`, which ESLint 10 removed in favor of
// `context.sourceCode`.
const withGetSourceCode = ( plugin ) => ( {
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
} );

/** @type {( plugin: import('eslint').ESLint.Plugin ) => import('eslint').Linter.Config[]} */
const recommended = ( plugin ) => [
	{
		name: '@automattic/json/recommended',
		// The JSON parser rejects ESLint's defaults (`'latest'`, `'module'`).
		languageOptions: { parser, ecmaVersion: 5, sourceType: 'script' },
		plugins: { 'json-es': withGetSourceCode( jsonEs ) },
		rules: { ...jsonEs.configs.recommended.rules, ...recommendedRules.rules },
	},
	{
		name: '@automattic/json/recommended/package-json',
		files: [ '**/package.json' ],
		plugins: { '@automattic/json': plugin },
		rules: recommendedRules.packageJsonRules,
	},
];

module.exports = { recommended };
