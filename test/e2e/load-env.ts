// This has to be done in a separate file so we can ensure the environment
// variables get loaded before `@automattic/calypso-e2e` is imported.
import { resolve } from 'path';
import { config } from 'dotenv';
import { getWorktreePort } from '../../client/server/config/default-port';

const repoRoot = resolve( __dirname, '../..' );

config( { path: resolve( repoRoot, '.env' ) } );

// The local dev server of a linked git worktree listens on its own default port.
const worktreePort = getWorktreePort( repoRoot );
if ( ! process.env.PORT && worktreePort ) {
	process.env.PORT = String( worktreePort );
}
