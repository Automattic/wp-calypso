// Flat-config versions of the legacy presets, built from the same rule objects.
const legacyReact = require( './react' );
const legacyRecommended = require( './recommended' );

// ES-module-only plugins come back as a namespace object.
const load = ( name ) => {
	const module = require( name );
	return module.default ?? module;
};

// The plugin's rules call `context.getSourceCode()`, which ESLint 10 removed. `context.sourceCode`
// replaces it from ESLint 8.40 on.
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

const recommended = ( plugin ) => {
	const jsdoc = load( 'eslint-plugin-jsdoc' );
	return [
		{ name: 'eslint/recommended', ...load( '@eslint/js' ).configs.recommended },
		jsdoc.configs[ 'flat/recommended' ],
		{
			name: 'wpcalypso/recommended',
			languageOptions: {
				// Matches the legacy preset's `env: { es6: true }` globals.
				ecmaVersion: 2015,
				parser: load( '@babel/eslint-parser' ),
				parserOptions: legacyRecommended.parserOptions,
			},
			plugins: {
				wpcalypso: plugin,
				'inclusive-language': withGetSourceCode( load( 'eslint-plugin-inclusive-language' ) ),
			},
			settings: legacyRecommended.settings,
			rules: legacyRecommended.rules,
		},
		// The legacy override's test-file exception. Its `*.json` and `*.md` patterns would select
		// those files; consumers scope these presets to JavaScript with `files` instead.
		{
			name: 'wpcalypso/recommended/test-files',
			files: [ '**/test/*' ],
			rules: legacyRecommended.overrides[ 0 ].rules,
		},
	];
};

const react = ( plugin ) => {
	const { ecmaFeatures, sourceType } = legacyReact.parserOptions;
	return [
		...plugin.configs[ 'flat/recommended' ],
		{
			name: 'wpcalypso/react',
			languageOptions: { sourceType, parserOptions: { ecmaFeatures } },
			plugins: {
				react: load( 'eslint-plugin-react' ),
				'react-hooks': load( 'eslint-plugin-react-hooks' ),
			},
			rules: legacyReact.rules,
		},
	];
};

module.exports = { recommended, react };
