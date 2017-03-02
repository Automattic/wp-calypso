/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const fs = require( 'fs' );
const path = require( 'path' );

/** @type {String} path to configuration file directory */
const configRoot = path.resolve( __dirname, '../../', 'config' );

/**
 * @type {RegExp} matches possible config files
 *
 *  - doesn't start with an underscore
 *  - ends in `.json`
 */
const environmentConfigPattern = /^(?!_)[^.]+\.json$/;

/**
 * Attempts to parse JSON data
 *
 * If data doesn't parse it will return
 * `null` instead of throwing an error
 *
 * @param {*} data
 * @returns {*}
 */
const parseJSON = data => {
	try {
		return JSON.parse( data );
	} catch (e) {
		return null;
	}
};

/** @type {String[]} list of configuration files */
const environmentConfigFiles = fs
	.readdirSync( configRoot, { encoding: 'utf8' } )
	.filter( filename => environmentConfigPattern.test( path.basename( filename ) ) )
	.filter( filename => ! ( /secrets/g ).test( filename ) )
	.filter( filename => ! ( /client/g ).test( filename ) );

/** @type {Array} list of [ filename, data ] pairs */
const environmentConfigs = environmentConfigFiles
	.map( filename => [ filename, fs.readFileSync( path.join( configRoot, filename ), { encoding: 'utf8' } ) ] )
	.map( ( [ filename, data ] ) => [ filename, parseJSON( data ) ] );

/** @type {Object} config data in the shared config file (defaults) */
const sharedConfig = parseJSON( fs.readFileSync( path.join( configRoot, '_shared.json' ), { encoding: 'utf8' } ) );

/** @type {Array} list of [ filename, list of keys ] pairs */
const environmentKeys = environmentConfigs
	.map( ( [ filename, data ] ) => [ filename, Object.keys( data ) ] );

/**
 * Iterate over all of the keys in each configuration file
 * and check if that key is also present in the shared file.
 * If a key is missing from the shared file (meaning that
 * there is no default value) then we want to flag it as
 * invalid. Such a missing value could and likely would
 * cause runtime errors in Calypso
 */
environmentKeys.forEach( ( [ filename, keys ] ) => {
	keys.forEach( key => {
		if ( ! sharedConfig.hasOwnProperty( key ) ) {
			console.error(
				`${ chalk.red( 'Configuration Error' ) }\n` +
				`Key ${ chalk.blue( key ) } defined in ${ chalk.blue( filename ) } ` +
				`but not in ${ chalk.blue( '_shared.json' ) }\n` +
				`Please add a default value in ${ chalk.blue( '_shared.json' ) } ` +
				`before adding overrides in the environment-specific config files.`
			);

			process.exit( 1 );
		}
	} );
} );
