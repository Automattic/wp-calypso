import { rmSync } from 'node:fs';
import { clearStaleLoginLocks } from '@automattic/calypso-e2e';
import { PENDING_CLOSE_DIR } from '../specs/shared/api-close-account';

export default async function globalSetup(): Promise< void > {
	// Records left by an earlier run hold live bearer tokens, and nothing else
	// removes them outside CI. They are keyed only by user ID, so a later run
	// would also adopt them and report someone else's account as its own leak.
	rmSync( PENDING_CLOSE_DIR, { recursive: true, force: true } );

	// A lock still on disk before any worker starts has no holder to wait for.
	clearStaleLoginLocks();
}
