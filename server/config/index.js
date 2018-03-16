/** @format */
/**
 * Internal dependencies
 */

const configPath = require( 'path' ).resolve( __dirname, '..', '..', 'config' );
const parser = require( './parser' );
const createConfig = require( '../../client/lib/create-config' );

const { serverData: data, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES,
} );
const ssrConfig = `var configData = ${ JSON.stringify( clientData ) };`;

module.exports = createConfig( data );
module.exports.ssrConfig = ssrConfig;
