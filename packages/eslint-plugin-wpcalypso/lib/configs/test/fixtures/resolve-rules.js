// Prints what a flat preset resolves for a file, next to what its legacy preset declares, as
// `{ legacy, flat }` JSON. Both go through the same ESLint, so default options fill in alike.
const path = require( 'path' );
const { ESLint } = require( 'eslint' );
const { defineConfig } = require( 'eslint/config' );
const plugin = require( '../../..' );
const legacyReact = require( '../../react' );
const legacyRecommended = require( '../../recommended' );

const [ preset, file ] = process.argv.slice( 2 );
const cwd = path.resolve( __dirname, '../../../..' );
const load = ( name ) => {
	const module = require( name );
	return module.default ?? module;
};

// The legacy preset's `extends` chain, flattened by hand: `eslint:recommended` (now `@eslint/js`),
// `plugin:jsdoc/recommended`, its own settings, the React preset on top, and the test-file override.
const legacyConfig = () => {
	const jsdoc = load( 'eslint-plugin-jsdoc' );
	const isReact = preset === 'react';
	const isTest = /(^|\/)test\/[^/]+$/.test( file );
	return {
		files: [ '**/*.{js,jsx}' ],
		languageOptions: {
			parser: load( legacyRecommended.parser ),
			parserOptions: {
				...legacyRecommended.parserOptions,
				...( isReact && { ecmaFeatures: legacyReact.parserOptions.ecmaFeatures } ),
			},
			// The Babel parser's default when the legacy preset sets none.
			sourceType: isReact ? legacyReact.parserOptions.sourceType : 'module',
		},
		plugins: {
			jsdoc,
			wpcalypso: plugin,
			'inclusive-language': load( 'eslint-plugin-inclusive-language' ),
			...( isReact && {
				react: load( 'eslint-plugin-react' ),
				'react-hooks': load( 'eslint-plugin-react-hooks' ),
			} ),
		},
		settings: legacyRecommended.settings,
		rules: {
			...load( '@eslint/js' ).configs.recommended.rules,
			...jsdoc.configs.recommended.rules,
			...legacyRecommended.rules,
			...( isReact && legacyReact.rules ),
			...( isTest && legacyRecommended.overrides[ 0 ].rules ),
		},
	};
};

const resolve = async ( overrideConfig ) => {
	const eslint = new ESLint( { cwd, overrideConfigFile: true, overrideConfig } );
	const config = await eslint.calculateConfigForFile( path.join( cwd, file ) );
	return {
		rules: Object.fromEntries(
			Object.entries( config.rules ).map( ( [ name, value ] ) => {
				const [ severity, ...options ] = Array.isArray( value ) ? value : [ value ];
				return [ name, [ { off: 0, warn: 1, error: 2 }[ severity ] ?? severity, ...options ] ];
			} )
		),
		settings: config.settings,
		ecmaFeatures: config.languageOptions.parserOptions.ecmaFeatures,
		sourceType: config.languageOptions.sourceType,
		parser: config.languageOptions.parser.meta.name,
	};
};

( async () => {
	process.stdout.write(
		JSON.stringify( {
			legacy: await resolve( [ legacyConfig() ] ),
			// The preset as the README sets it up.
			flat: await resolve(
				defineConfig( [
					{ files: [ '**/*.{js,jsx}' ], extends: [ plugin.configs[ `flat/${ preset }` ] ] },
				] )
			),
		} )
	);
} )();
