/**
 * Module dependencies
 */
const fs = require( 'fs' ),
	path = require( 'path' ),
	assign = require( 'lodash/object/assign' ),
	debug = require( 'debug' )( 'config' );

function getDataFromFile( filename ) {
	var filePath = path.resolve( __dirname, filename ),
		fileData = {};

	if ( fs.existsSync( filePath ) ) {
		debug( 'getting data from config file: %o', filename );
		fileData = JSON.parse( fs.readFileSync( filePath, 'utf8' ) );
	} else {
		debug( 'skipping config file; not found: %o', filename );
	}

	return fileData;
}

module.exports = function( opts ) {
	var opts = assign( opts, {
			env: 'development',
			secrets: false
		} ),
		data = {},
		configPaths = [
			'__base.json',
			opts.env + '.json',
			opts.env + '.local.json'
		],
		actualSecretsPath,
		emptySecretsPath,
		secretsPath,
		enabledFeatures = process.env.ENABLE_FEATURES ? process.env.ENABLE_FEATURES.split( ',' ) : [],
		disabledFeatures = process.env.DISABLE_FEATURES ? process.env.DISABLE_FEATURES.split( ',' ) : [];

	if ( opts.secrets ) {
		actualSecretsPath = path.resolve( __dirname, '..', '..', 'config', 'secrets.json' );
		emptySecretsPath = path.resolve( __dirname, '..', '..', 'config', 'empty-secrets.json' );
		secretsPath = fs.existsSync( actualSecretsPath ) ? actualSecretsPath : emptySecretsPath;

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
