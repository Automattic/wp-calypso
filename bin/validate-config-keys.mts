import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

interface Config {
	[ key: string ]: string | boolean | number | object | undefined;
	features?: Record< string, boolean >;
}

/**
 * Features that are manually enabled in the codebase using `config.enable`.
 */
const PROGRAMMATICALLY_ENABLED_FEATURES = new Set< string >( [ 'a4a-partner-directory' ] );

/** path to configuration file directory */
const configRoot = path.resolve( import.meta.dirname, '../config' );

/**
 * Reads a config file given its basename
 * @param filename basename of config file to read, e.g. 'development.json'
 * @returns contents of file
 */
const readConfigFile = ( filename: string ): string =>
	fs.readFileSync( path.join( configRoot, filename ), { encoding: 'utf8' } );

/**
 * Reads and parses the data from a
 * config file given its basename
 * @throws SyntaxError if contents of config file not valid JSON
 * @param filename basename of config file to read, e.g. 'development.json'
 * @returns parsed data from config file contents
 */
const parseConfig = ( filename: string ): Config => JSON.parse( readConfigFile( filename ) );

/** list of [ filename, config data ] configuration pairs */
const environmentKeys: Array< [ string, Config ] > = fs
	.readdirSync( configRoot, { encoding: 'utf8' } )
	.filter( ( filename ) => /\.json$/.test( path.basename( filename ) ) ) // only the JSON config files
	.filter( ( filename ) => '_shared.json' !== filename ) // base config for all environments
	.filter( ( filename ) => 'client.json' !== filename ) // list of keys allowed in client
	.filter( ( filename ) => ! /secrets/g.test( filename ) ) // secret tokens not part of this system
	.map( ( filename ) => [ filename, parseConfig( filename ) ] );

/** config data in the shared config file (defaults) */
const sharedConfig = parseConfig( '_shared.json' );

/** map of feature keys to whether they are enabled in any environment */
const featuresEnabled = new Map< string, boolean >();

/** flag to indicate if any errors were found */
let isFailure = false;

/**
 * Iterate over all of the keys in each configuration file
 * and check if that key is also present in the shared file.
 * If a key is missing from the shared file (meaning that
 * there is no default value) then we want to flag it as
 * invalid. Such a missing value could and likely would
 * cause runtime errors in Calypso
 */
environmentKeys.forEach( ( [ filename, config ] ) => {
	Object.keys( config ).forEach( ( key ) => {
		if ( ! sharedConfig.hasOwnProperty( key ) ) {
			console.error(
				`${ chalk.red( 'Configuration Error' ) }\n` +
					`Key ${ chalk.blue( key ) } defined in ${ chalk.blue( filename ) } ` +
					`but not in ${ chalk.blue( '_shared.json' ) }\n` +
					`Please add a default value in ${ chalk.blue( '_shared.json' ) } ` +
					'before adding overrides in the environment-specific config files.'
			);

			isFailure = true;
		}
	} );

	Object.keys( config.features ?? {} ).forEach( ( key ) => {
		featuresEnabled.set( key, featuresEnabled.get( key ) || config.features![ key ] );
	} );
} );

/**
 * Check if any features are not enabled in any environment.
 * Features that are not enabled in any environment should be
 * removed from the codebase. If a feature is under development,
 * it should be enabled in the development environment. If a
 * feature is being disabled temporarily, it should be removed
 * from code and reverted when (if) the feature is ready to be
 * enabled again.
 */
Array.from( featuresEnabled.entries() )
	.filter( ( [ key, isEnabled ] ) => ! isEnabled && ! PROGRAMMATICALLY_ENABLED_FEATURES.has( key ) )
	.forEach( ( [ key ] ) => {
		console.error(
			`${ chalk.red( 'Configuration Error' ) }\n` +
				`Feature ${ chalk.blue( key ) } is not enabled in any environment.`
		);
		isFailure = true;
	} );

if ( isFailure ) {
	process.exit( 1 ); // eslint-disable-line
}
