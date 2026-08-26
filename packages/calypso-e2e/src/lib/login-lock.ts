import fs from 'node:fs';
import path from 'node:path';
import envVariables from '../env-variables';

const POLL_INTERVAL_MS = 250;

// Bumped when a test ends, so waiters that test left behind stop polling.
let waitGeneration = 0;

// Locks this process holds right now, so the exit handler can drop them.
const heldLocks = new Set< string >();

process.on( 'exit', () => {
	for ( const lockPath of heldLocks ) {
		fs.rmSync( lockPath, { recursive: true, force: true } );
	}
} );

/**
 * Runs a callback while holding the account's local login lock.
 *
 * The lock is a directory, because mkdir is the one file system call that both creates and
 * reports the collision: the winner gets the directory, every loser gets EEXIST. Nothing
 * takes a lock off its holder, so no two workers can be inside the same login.
 *
 * This lock is not reentrant; wrapping TestAccount.authenticate(), which takes it internally, self-deadlocks until the test times out.
 */
export async function withLoginLock< T >(
	accountName: string,
	fn: () => Promise< T >
): Promise< T > {
	fs.mkdirSync( envVariables.COOKIES_PATH, { recursive: true } );
	const lockPath = path.join( envVariables.COOKIES_PATH, `${ accountName }.lock` );

	const generation = waitGeneration;

	for (;;) {
		// Checked before mkdir, not just before the sleep: an abandoned waiter whose timer
		// already fired must not take the lock on its way out.
		if ( generation !== waitGeneration ) {
			throw new Error(
				`Abandoned the wait for the ${ accountName } login lock: the test that wanted it has ended.`
			);
		}
		try {
			fs.mkdirSync( lockPath );
			break;
		} catch ( error ) {
			if ( ( error as NodeJS.ErrnoException ).code !== 'EEXIST' ) {
				throw error;
			}
			await new Promise( ( resolve ) => setTimeout( resolve, POLL_INTERVAL_MS ) );
		}
	}

	heldLocks.add( lockPath );

	try {
		return await fn();
	} finally {
		try {
			// Drop the entry only once the directory is gone, so a failed removal is left to
			// the exit handler rather than replacing fn's own result.
			fs.rmSync( lockPath, { recursive: true, force: true } );
			heldLocks.delete( lockPath );
		} catch {}
	}
}

/**
 * Abandons every withLoginLock call still waiting for its lock.
 *
 * Called from fixture teardown: Playwright abandons a timed-out test's await but cannot
 * cancel its promises, so a waiter it started would keep polling and could take the lock
 * during worker teardown. Once any teardown runs the test body is over, so a wait still
 * pending belongs to no live test and aborting it cannot fail one. Only the wait is
 * abandoned; a holder already past it finishes and releases as usual.
 */
export function abandonPendingLoginLockWaits(): void {
	waitGeneration++;
}

/**
 * Removes every login lock in the cookies directory.
 *
 * Only safe before any worker starts, and only for one run at a time: a lock on disk then
 * belongs to a run that died without releasing it. Two runs sharing COOKIES_PATH would
 * clear each other's live locks.
 */
export function clearStaleLoginLocks(): void {
	for ( const lock of fs.globSync( '*.lock', { cwd: envVariables.COOKIES_PATH } ) ) {
		fs.rmSync( path.join( envVariables.COOKIES_PATH, lock ), { recursive: true, force: true } );
	}
}
