// Flat-config version of the `recommended` preset, built from the same rule objects.
const jsonEs = require( 'eslint-plugin-json-es' );
const parser = require( '../parser' );
const legacy = require( './recommended' );

// Legacy override globs without a slash match at any depth; flat ones are relative to the config.
const toFlatFiles = ( files ) =>
	files.map( ( file ) => ( file.includes( '/' ) ? file : `**/${ file }` ) );

const recommended = ( plugin ) => [
	{
		name: '@automattic/json/recommended',
		files: [ '**/*.json' ],
		// The JSON parser rejects flat config's defaults (`'latest'`, `'module'`); these are the legacy ones.
		languageOptions: { parser, ecmaVersion: 5, sourceType: 'script' },
		plugins: { 'json-es': jsonEs },
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
