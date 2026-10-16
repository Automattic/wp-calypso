// Flat-config versions of the legacy presets, built from the same rule objects.
const legacyReact = require( './react' );
const legacyRecommended = require( './recommended' );

// ES-module-only plugins come back as a namespace object.
const load = ( name ) => {
	const module = require( name );
	return module.default ?? module;
};

// Legacy override globs without a slash match at any depth; flat ones are relative to the config.
const toFlatFiles = ( files ) =>
	files.map( ( file ) => ( file.includes( '/' ) ? file : `**/${ file }` ) );

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
				jsdoc,
				wpcalypso: plugin,
				'inclusive-language': load( 'eslint-plugin-inclusive-language' ),
			},
			settings: legacyRecommended.settings,
			rules: legacyRecommended.rules,
		},
		...legacyRecommended.overrides.map( ( { files, ...rest }, index ) => ( {
			name: `wpcalypso/recommended/overrides/${ index }`,
			files: toFlatFiles( files ),
			...rest,
		} ) ),
	];
};

const react = ( plugin ) => {
	const { ecmaFeatures, sourceType } = legacyReact.parserOptions;
	return [
		...recommended( plugin ),
		// Flat config lints only `.js`-style files unless a config selects others.
		{ name: 'wpcalypso/react/files', files: [ '**/*.jsx' ] },
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
