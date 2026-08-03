import { rmSync } from 'node:fs';
import { PENDING_CLOSE_DIR } from '../specs/shared/api-close-account';

/**
 * Drops deferred-close records left by an earlier run.
 *
 * Records hold live bearer tokens, and nothing else removes them outside CI: an
 * aborted local run would otherwise leave credentials on disk indefinitely. They
 * are also keyed only by user ID, so a later unrelated run would adopt them and
 * report someone else's account as its own leak - with no retry budget, since
 * their deprovision deadline is long past.
 */
export default function globalSetup(): void {
	rmSync( PENDING_CLOSE_DIR, { recursive: true, force: true } );
}
