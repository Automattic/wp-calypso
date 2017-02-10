/***** WARNING: ES5 code only here. Used by un-transpiled script! *****/

/**
 * Module dependencies
 */
const fs = require( 'fs' ),
	path = require( 'path' ),
	assign = require( 'lodash/assign' ),
	debug = require( 'debug' )( 'config' );

function getDataFromFile( file ) {
	var fileData = {};

	if ( fs.existsSync( file ) ) {
		debug( 'getting data from config file: %o', file );
		fileData = JSON.parse( fs.readFileSync( file, 'utf8' ) );
	} else {
		debug( 'skipping config file; not found: %o', file );
	}

	return fileData;
}

module.exports = function( configPath, defaultOpts ) {
	var opts = assign( {
			env: 'development',
		}, defaultOpts ),
		data = {},
		configFiles = [
			path.resolve( configPath, '_shared.json' ),
			path.resolve( configPath, opts.env + '.json' ),
			path.resolve( configPath, opts.env + '.local.json' )
		],
		realSecretsPath = path.resolve( configPath, 'secrets.json' ),
		emptySecretsPath = path.resolve( configPath, 'empty-secrets.json' ),
		secretsPath = fs.existsSync( realSecretsPath ) ? realSecretsPath : emptySecretsPath,
		enabledFeatures = opts.enabledFeatures ? opts.enabledFeatures.split( ',' ) : [],
		disabledFeatures = opts.disabledFeatures ? opts.disabledFeatures.split( ',' ) : [];

	configFiles.forEach( function( file ) {
		assign( data, getDataFromFile( file ) );
	} );

	if ( data.hasOwnProperty( 'features' ) ) {
		enabledFeatures.forEach( function( feature ) {
			data.features[ feature ] = true;
			debug( 'overriding feature %s to true', feature );
		} );
		disabledFeatures.forEach( function( feature ) {
			data.features[ feature ] = false;
			debug( 'overriding feature %s to false', feature );
		} );
	}

	const serverData = assign( {}, data, getDataFromFile( secretsPath ) );
	const clientData = assign( {}, data );
	
	return { serverData, clientData };
}
