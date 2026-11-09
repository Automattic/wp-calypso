import { createRequire } from 'node:module';
import path from 'node:path';
import createConfig, { resolveTemplates } from '@automattic/create-calypso-config';

const require = createRequire( import.meta.url );
const client = path.resolve( import.meta.dirname, '../../client' );
const parser = require( path.join( client, 'server/config/parser.js' ) );
const { serverData, clientData: rawClientData } = parser( path.resolve( client, '../config' ), {
	env: process.env.CALYPSO_ENV || process.env.NODE_ENV || 'development',
	enabledFeatures: process.env.ENABLE_FEATURES,
	disabledFeatures: process.env.DISABLE_FEATURES,
} );
const config = createConfig( serverData ) as any;
config.clientData = resolveTemplates( rawClientData );
export default config;
export const isEnabled = config.isEnabled;
export const enabledFeatures = config.enabledFeatures;
export const enable = config.enable;
export const disable = config.disable;
export const clientData = config.clientData;
