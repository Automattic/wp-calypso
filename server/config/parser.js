/***** WARNING: ES5 code only here. Used by un-transpiled script! *****/

/**
 * Module dependencies
 */
const fs = require( 'fs' ),
	path = require( 'path' ),
	assign = require( 'lodash/object/assign' ),
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

module.exports = function( opts ) {
	var opts = assign( {
			env: 'development',
			includeSecrets: false,
			configPath: null
		}, opts ),
		// TODO: validate configPath
		data = {},
		configPaths = [
			path.resolve( opts.configPath, '_shared.json' ),
			path.resolve( opts.configPath, opts.env + '.json' ),
			path.resolve( opts.configPath, opts.env + '.local.json' )
		],
		realSecretsPath,
		emptySecretsPath,
		secretsPath,
		enabledFeatures = process.env.ENABLE_FEATURES ? process.env.ENABLE_FEATURES.split( ',' ) : [],
		disabledFeatures = process.env.DISABLE_FEATURES ? process.env.DISABLE_FEATURES.split( ',' ) : [];

	if ( opts.includeSecrets ) {
		realSecretsPath = path.resolve( opts.configPath, 'secrets.json' );
		emptySecretsPath = path.resolve( opts.configPath, 'empty-secrets.json' );
		secretsPath = fs.existsSync( realSecretsPath ) ? realSecretsPath : emptySecretsPath;

		configPaths.push( secretsPath );
	}

	configPaths.forEach( function( configPath ) {
		assign( data, getDataFromFile( configPath ) );
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

	return data;
}
