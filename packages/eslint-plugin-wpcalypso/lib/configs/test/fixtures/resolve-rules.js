// Prints what each preset format resolves for a file, as `{ legacy, flat }` JSON.
const path = require( 'path' );
// This package's ESLint 8 resolves rules as written; ESLint 9's flat mode fills in default options
// that its legacy mode doesn't. `defineConfig` comes from the repo's ESLint 9, as ESLint 8 lacks it.
const { loadESLint } = require( 'eslint' );
const { defineConfig } = require(
	require.resolve( 'eslint/config', { paths: [ path.resolve( __dirname, '../../../../../..' ) ] } )
);
const plugin = require( '../../..' );

const [ legacyPreset, file ] = process.argv.slice( 2 );
const cwd = path.resolve( __dirname, '../../../..' );

// Severities as numbers, so `'error'` and `2` compare equal.
const normalize = ( rules ) =>
	Object.fromEntries(
		Object.entries( rules ).map( ( [ name, value ] ) => {
			const [ severity, ...options ] = Array.isArray( value ) ? value : [ value ];
			return [ name, [ { off: 0, warn: 1, error: 2 }[ severity ] ?? severity, ...options ] ];
		} )
	);

( async () => {
	const Legacy = await loadESLint( { useFlatConfig: false } );
	const Flat = await loadESLint( { useFlatConfig: true } );
	const legacy = new Legacy( {
		cwd,
		useEslintrc: false,
		overrideConfig: { extends: [ `plugin:wpcalypso/${ legacyPreset }` ] },
	} );
	const flat = new Flat( {
		cwd,
		overrideConfigFile: true,
		// The preset as the README sets it up.
		overrideConfig: defineConfig( [
			{ files: [ '**/*.{js,jsx}' ], extends: [ plugin.configs[ `flat/${ legacyPreset }` ] ] },
		] ),
	} );
	const target = path.join( cwd, file );
	const legacyConfig = await legacy.calculateConfigForFile( target );
	const flatConfig = await flat.calculateConfigForFile( target );
	process.stdout.write(
		JSON.stringify( {
			legacy: {
				rules: normalize( legacyConfig.rules ),
				settings: legacyConfig.settings,
				ecmaFeatures: legacyConfig.parserOptions.ecmaFeatures,
				// Unset, so the Babel parser's default.
				sourceType: legacyConfig.parserOptions.sourceType ?? 'module',
			},
			flat: {
				rules: normalize( flatConfig.rules ),
				settings: flatConfig.settings,
				ecmaFeatures: flatConfig.languageOptions.parserOptions.ecmaFeatures,
				sourceType: flatConfig.languageOptions.sourceType,
			},
		} )
	);
} )();
