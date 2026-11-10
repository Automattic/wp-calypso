/*
 * WARNING: plain CommonJS only here. Required by un-transpiled scripts,
 * e.g. `.agents/skills/verify/scripts/lib.cjs`.
 */

const crypto = require( 'crypto' );
const fs = require( 'fs' );
const path = require( 'path' );

const MAIN_CHECKOUT_PORT = 3000;

// Above the ports local services usually take, below the ephemeral ranges of Linux (32768)
// and macOS (49152), and clear of the ports browsers refuse to open.
const WORKTREE_PORT_START = 20000;
const WORKTREE_PORT_COUNT = 10000;

/**
 * A linked worktree has a `.git` file pointing at its git dir; the main checkout has a
 * `.git` directory, and a build outside git (e.g. the Docker image) has neither.
 */
function isLinkedWorktree( repoRoot ) {
	try {
		return fs.statSync( path.join( repoRoot, '.git' ) ).isFile();
	} catch {
		return false;
	}
}

/**
 * Returns the port a checkout's dev server uses when `PORT` isn't set: 3000 in the main
 * checkout, and a port derived from the checkout's path in a linked worktree, so that
 * servers of different worktrees don't answer on each other's port.
 */
function getDefaultPort( repoRoot ) {
	if ( ! isLinkedWorktree( repoRoot ) ) {
		return MAIN_CHECKOUT_PORT;
	}
	const hash = crypto.createHash( 'sha1' ).update( fs.realpathSync( repoRoot ) ).digest();
	return WORKTREE_PORT_START + ( hash.readUInt32BE( 0 ) % WORKTREE_PORT_COUNT );
}

module.exports = {
	MAIN_CHECKOUT_PORT,
	WORKTREE_PORT_START,
	WORKTREE_PORT_COUNT,
	getDefaultPort,
};
