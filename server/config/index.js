/**
 * Module dependencies
 */
var fs = require( 'fs' ),
	path = require( 'path' ),
	assign = require( 'lodash/object/assign' ),
	debug = require( 'debug' )( 'config' );

var env = process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	filename = env + '.json',
	configPath = path.resolve( __dirname, '..', '..', 'config', filename ),
	actualSecretsPath = path.resolve( __dirname, '..', '..', 'config', 'secrets.json' ),
	emptySecretsPath = path.resolve( __dirname, '..', '..', 'config', 'empty-secrets.json' ),
	secretsPath = fs.existsSync( actualSecretsPath ) ? actualSecretsPath : emptySecretsPath,
	secretsData =  JSON.parse( fs.readFileSync( secretsPath, 'utf8' ) ),
	data = JSON.parse( fs.readFileSync( configPath, 'utf8' ) ),
	enabledFeatures = process.env.ENABLE_FEATURES ? process.env.ENABLE_FEATURES.split(',') : [],
	disabledFeatures = process.env.DISABLE_FEATURES ? process.env.DISABLE_FEATURES.split(',') : [];

assign( data, secretsData );

debug( 'using configuration file: %o', filename );

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

/**
 * Return config `key`.
 * Throws an error if the requested `key` is not set in the config file.
 *
 * @param {String} key
 * @return {Mixed}
 * @api public
 */
function config( key ) {
	if ( key in data ) {
		return data[ key ];
	}
	throw new Error( 'config key `' + key + '` does not exist in "' + filename + '"' );
}

function isEnabled( feature ) {
	return !! data.features[ feature ];
}

function anyEnabled() {
	var args = Array.prototype.slice.call( arguments );
	return args.some( function( feature ) {
		return !! data.features[ feature ];
	} );
}

module.exports = config;
module.exports.isEnabled = isEnabled;
module.exports.anyEnabled = anyEnabled;
