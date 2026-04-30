// Loaded as a side-effect import so .env values are populated into
// process.env before any module that reads them at evaluation time
// (notably @automattic/calypso-e2e's env-variables, which captures
// process.env.PORT into its default base URLs at class construction).
// Keeping this in its own file lets us import it ahead of everything else.
import { resolve } from 'path';
import { config } from 'dotenv';

config( { path: resolve( __dirname, '../../.env' ) } );
