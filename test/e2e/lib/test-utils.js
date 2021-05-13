/**
 * External dependencies
 */
import path from 'path';

const BASE_PATH = process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' );

export const generatePath = ( name ) => path.join( BASE_PATH, name );
