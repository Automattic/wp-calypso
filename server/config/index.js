/**
 * External dependencies
 */
import { template, get } from 'lodash';

/**
 * Internal dependencies
 */
const configPath = require( 'path' ).resolve( __dirname, '..', '..', 'config' );
const parser = require( './parser' );

const { serverData, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES
} );

// if in browser, grab configData, if in server use serverData
const data = 'undefined' !== typeof window && window.configData
	? window.configData
	: serverData;

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

config.isEnabled = function( feature ) {
	return !! data.features[ feature ];
}

config.anyEnabled = function() {
	var args = Array.prototype.slice.call( arguments );
	return args.some( function( feature ) {
		return isEnabled( feature );
	} );
}

const ssrConfig = template( 'var configData = <%= data %>;' )( {
	data: JSON.stringify( clientData ),
} );

module.exports = config;
module.exports.ssrConfig = ssrConfig;
