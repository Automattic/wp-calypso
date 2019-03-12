/**
 * Internal dependencies
 */
const { featuresEnabled, featuresDisabled } = require( '../../webpack.common' );
const configPath = require( 'path' ).resolve( __dirname, '..', '..', 'config' );
const parser = require( './parser' );
const createConfig = require( '../../client/lib/create-config' );

const { serverData, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: featuresEnabled,
	disabledFeatures: featuresDisabled,
} );

module.exports = createConfig( serverData );
module.exports.clientData = clientData;
