const template = require( 'lodash/template' );
const configPath = require( 'path' ).resolve( __dirname, '..', '..', 'config' );
const parser = require( './parser' );

const { serverData: data, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES
} );

/**
 * Return config `key`.
 * Throws an error if the requested `key` is not set in the config file.
 *
 * @param {String} key The key of the config entry.
 * @return {Mixed} Value of config or error if not found.
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
		return isEnabled( feature );
	} );
}

const ssrConfig = template(
	'var data = <%= data %>;' +
	'<%= config %>' +
	'<%= isEnabled %>' +
	'<%= anyEnabled %>'
) ( {
	data: JSON.stringify( clientData ),
	config: config.toString(),
	isEnabled: isEnabled.toString(),
	anyEnabled: anyEnabled.toString(),
} );

module.exports = config;
module.exports.isEnabled = isEnabled;
module.exports.anyEnabled = anyEnabled;
module.exports.ssrConfig = ssrConfig;
