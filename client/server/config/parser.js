/*
 * WARNING: ES5 code only here. Used by un-transpiled script!
 */

/**
 * Module dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const { assignWith } = require( 'lodash' );
const debug = require( 'debug' )( 'config' );

function getDataFromFile( file ) {
	let fileData = {};

	if ( fs.existsSync( file ) ) {
		debug( 'getting data from config file: %o', file );
		fileData = JSON.parse( fs.readFileSync( file, 'utf8' ) );
	} else {
		debug( 'skipping config file; not found: %o', file );
	}

	return fileData;
}

module.exports = function ( configPath, defaultOpts ) {
	const opts = Object.assign(
		{
			env: 'development',
		},
		defaultOpts
	);
	const data = {};
	const configFiles = [
		path.resolve( configPath, '_shared.json' ),
		path.resolve( configPath, opts.env + '.json' ),
		path.resolve( configPath, opts.env + '.local.json' ),
	];
	const realSecretsPath = path.resolve( configPath, 'secrets.json' );
	const emptySecretsPath = path.resolve( configPath, 'empty-secrets.json' );
	const secretsPath = fs.existsSync( realSecretsPath ) ? realSecretsPath : emptySecretsPath;
	const enabledFeatures = opts.enabledFeatures ? opts.enabledFeatures.split( ',' ) : [];
	const disabledFeatures = opts.disabledFeatures ? opts.disabledFeatures.split( ',' ) : [];

	configFiles.forEach( function ( file ) {
		// merge the objects in `features` field, and do a simple assignment for other fields
		assignWith( data, getDataFromFile( file ), ( objValue, srcValue, key ) =>
			key === 'features' ? { ...objValue, ...srcValue } : undefined
		);
	} );

	if ( data.hasOwnProperty( 'features' ) ) {
		enabledFeatures.forEach( function ( feature ) {
			data.features[ feature ] = true;
			debug( 'overriding feature %s to true', feature );
		} );
		disabledFeatures.forEach( function ( feature ) {
			data.features[ feature ] = false;
			debug( 'overriding feature %s to false', feature );
		} );
	}

	if (
		secretsPath !== realSecretsPath &&
		data.features &&
		data.features[ 'wpcom-user-bootstrap' ]
	) {
		console.error( 'Disabling server-side user-bootstrapping because of a missing secrets.json' );
		data.features[ 'wpcom-user-bootstrap' ] = false;
	}

	// `protocol`, `hostname` and `port` config values can be overridden by env variables
	data.protocol = process.env.PROTOCOL || data.protocol;
	data.hostname = process.env.HOST || data.hostname;
	data.port = process.env.PORT || data.port;

	const serverData = Object.assign( {}, data, getDataFromFile( secretsPath ) );
	const clientData = Object.assign( {}, data );

	return { serverData, clientData };
};
