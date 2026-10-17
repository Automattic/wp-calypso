// Flat-config versions of the legacy presets, built from the same rule objects.
const { fixupPluginRules } = require( '@eslint/compat' );
const legacyReact = require( './react' );
const legacyRecommended = require( './recommended' );

// ES-module-only plugins come back as a namespace object.
const load = ( name ) => {
	const module = require( name );
	return module.default ?? module;
};

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
				// Its rule still calls a method that ESLint 10 removed.
				'inclusive-language': fixupPluginRules( load( 'eslint-plugin-inclusive-language' ) ),
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
				// Some of its rules still call methods that ESLint 10 removed.
				react: fixupPluginRules( load( 'eslint-plugin-react' ) ),
				'react-hooks': load( 'eslint-plugin-react-hooks' ),
			},
			rules: legacyReact.rules,
		},
	];
};

module.exports = { recommended, react };
