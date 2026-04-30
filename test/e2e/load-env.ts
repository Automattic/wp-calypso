// This has to be done in a separate file so we can ensure the environment
// variables get loaded before `@automattic/calypso-e2e` is imported.
import { resolve } from 'path';
import { config } from 'dotenv';

config( { path: resolve( __dirname, '../../.env' ) } );
