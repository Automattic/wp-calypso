// An ESM copy of client/server/config/index.js. Under the vm pools, Vitest's CommonJS executor
// would otherwise `require()` the TypeScript source of `@automattic/create-calypso-config`.
import { createRequire } from 'node:module';
import path from 'node:path';
import createConfig, { resolveTemplates } from '@automattic/create-calypso-config';

const require = createRequire( import.meta.url );
const repoRoot = path.resolve( import.meta.dirname, '../../..' );
const serverConfigDir = path.join( repoRoot, 'client/server/config' );

require( 'dotenv' ).config( { path: path.join( repoRoot, '.env' ) } );
const { getWorktreePort } = require( path.join( serverConfigDir, 'default-port.js' ) );
const parser = require( path.join( serverConfigDir, 'parser.js' ) );

const { serverData, clientData: rawClientData } = parser( path.join( repoRoot, 'config' ), {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES,
	defaultPort: getWorktreePort( repoRoot ),
} );

const config = Object.assign( createConfig( serverData ), {
	clientData: resolveTemplates( rawClientData ),
} );

export default config;
export const { isEnabled, enabledFeatures, enable, disable } = config;
export const clientData = config.clientData;
export const serverEnvId = clientData.env_id;
