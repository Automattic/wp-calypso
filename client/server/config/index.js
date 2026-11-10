const path = require( 'path' );
const repoRoot = path.resolve( __dirname, '..', '..', '..' );
const configPath = path.resolve( repoRoot, 'config' );
require( 'dotenv' ).config( {
	path: path.resolve( repoRoot, '.env' ),
} );
const { default: createConfig, resolveTemplates } = require( '@automattic/create-calypso-config' );
const { getDefaultPort } = require( './default-port' );
const parser = require( './parser' );

const { serverData, clientData } = parser( configPath, {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES,
	// Unit tests keep the port of the config files, so URLs in assertions don't depend on the checkout.
	defaultPort: process.env.NODE_ENV === 'test' ? undefined : getDefaultPort( repoRoot ),
} );

module.exports = createConfig( serverData );
module.exports.clientData = resolveTemplates( clientData );
