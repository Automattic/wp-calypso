const data = require( 'config/reader' )( {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	secrets: true
} );

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
	throw new Error( 'config key `' + key + '` does not exist' );
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
