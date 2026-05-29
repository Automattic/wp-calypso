const path = require( 'path' );
const configPath = path.resolve( __dirname, '..', '..', '..', 'config' );
require( 'dotenv' ).config( {
	path: path.resolve( configPath, '..', '.env' ),
} );
const { default: createConfig, resolveTemplates } = require( '@automattic/create-calypso-config' );
const parser = require( './parser' );

const { serverData, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES,
} );

module.exports = createConfig( serverData );
module.exports.clientData = resolveTemplates( clientData );
