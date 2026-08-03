import { rmSync } from 'node:fs';
import { PENDING_CLOSE_DIR } from '../specs/shared/api-close-account';

export default function globalSetup(): void {
	// Records left by an earlier run hold live bearer tokens, and nothing else
	// removes them outside CI. They are keyed only by user ID, so a later run
	// would also adopt them and report someone else's account as its own leak.
	rmSync( PENDING_CLOSE_DIR, { recursive: true, force: true } );
}
