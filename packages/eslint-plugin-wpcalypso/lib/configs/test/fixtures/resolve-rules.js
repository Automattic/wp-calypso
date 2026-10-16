// Prints the rules each preset format resolves for a file, as `{ legacy, flat }` JSON.
const path = require( 'path' );
const { loadESLint } = require( 'eslint' );
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
		overrideConfig: [
			...plugin.configs[ `flat/${ legacyPreset }` ],
			{ files: [ '**/*.jsx', '**/*.json' ] },
		],
	} );
	const target = path.join( cwd, file );
	const legacyRules = ( await legacy.calculateConfigForFile( target ) ).rules;
	const flatRules = ( await flat.calculateConfigForFile( target ) ).rules;
	process.stdout.write(
		JSON.stringify( { legacy: normalize( legacyRules ), flat: normalize( flatRules ) } )
	);
} )();
