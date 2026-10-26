// The presets, built from the rules `recommended.js` and `react.js` hold.
const reactRules = require( './react' );
const recommendedRules = require( './recommended' );

// ES-module-only plugins come back as a namespace object.
const load = ( name ) => {
	const module = require( name );
	return module.default ?? module;
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

const recommended = ( plugin ) => {
	const jsdoc = load( 'eslint-plugin-jsdoc' );
	return [
		{ name: 'eslint/recommended', ...load( '@eslint/js' ).configs.recommended },
		jsdoc.configs[ 'flat/recommended' ],
		{
			name: 'wpcalypso/recommended',
			// ESLint's own parser. Projects with Flow, TypeScript or proposal syntax set theirs after this.
			languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
			plugins: {
				wpcalypso: plugin,
				'inclusive-language': withGetSourceCode( load( 'eslint-plugin-inclusive-language' ) ),
			},
			settings: recommendedRules.settings,
			rules: recommendedRules.rules,
		},
		{
			name: 'wpcalypso/recommended/test-files',
			files: [ '**/test/*' ],
			rules: recommendedRules.testFileRules,
		},
	];
};

const react = ( plugin ) => [
	...plugin.configs.recommended,
	{
		name: 'wpcalypso/react',
		plugins: {
			react: load( 'eslint-plugin-react' ),
			'react-hooks': load( 'eslint-plugin-react-hooks' ),
		},
		rules: reactRules.rules,
	},
];

module.exports = { recommended, react };
