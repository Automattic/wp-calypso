/**
 * External dependencies
 */

const chalk = require( 'chalk' );
const fs = require( 'fs' );
const path = require( 'path' );

/** @type {string} path to configuration file directory */
const configRoot = path.resolve( __dirname, '../config' );

/**
 * Reads a config file given its basename
 *
 * @param {string} filename basename of config file to read, e.g. 'development.json'
 * @returns {string} contents of file
 */
const readConfigFile = ( filename ) =>
	fs.readFileSync( path.join( configRoot, filename ), { encoding: 'utf8' } );

/**
 * Reads and parses the data from a
 * config file given its basename
 *
 * @throws SyntaxError if contents of config file not valid JSON
 * @param {string} filename basename of config file to read, e.g. 'development.json'
 * @returns {*} parsed data from config file contents
 */
const parseConfig = ( filename ) => JSON.parse( readConfigFile( filename ) );

/** @type {Array} list of [ filename, config data keys ] configuration pairs */
const environmentKeys = fs
	.readdirSync( configRoot, { encoding: 'utf8' } )
	.filter( ( filename ) => /\.json$/.test( path.basename( filename ) ) ) // only the JSON config files
	.filter( ( filename ) => '_shared.json' !== filename ) // base config for all environments
	.filter( ( filename ) => 'client.json' !== filename ) // whitelist of keys allowed in client
	.filter( ( filename ) => ! /secrets/g.test( filename ) ) // secret tokens not part of this system
	.map( ( filename ) => [ filename, Object.keys( parseConfig( filename ) ) ] );

/** @type {object} config data in the shared config file (defaults) */
const sharedConfig = parseConfig( '_shared.json' );

/**
 * Iterate over all of the keys in each configuration file
 * and check if that key is also present in the shared file.
 * If a key is missing from the shared file (meaning that
 * there is no default value) then we want to flag it as
 * invalid. Such a missing value could and likely would
 * cause runtime errors in Calypso
 */
environmentKeys.forEach( ( [ filename, keys ] ) => {
	keys.forEach( ( key ) => {
		if ( ! sharedConfig.hasOwnProperty( key ) ) {
			console.error(
				`${ chalk.red( 'Configuration Error' ) }\n` +
					`Key ${ chalk.blue( key ) } defined in ${ chalk.blue( filename ) } ` +
					`but not in ${ chalk.blue( '_shared.json' ) }\n` +
					`Please add a default value in ${ chalk.blue( '_shared.json' ) } ` +
					'before adding overrides in the environment-specific config files.'
			);

			process.exit( 1 ); //eslint-disable-line
		}
	} );
} );
