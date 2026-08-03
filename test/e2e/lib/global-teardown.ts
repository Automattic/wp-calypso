import { reapPendingCloses } from '@automattic/calypso-e2e';
import { LEAK_DIR, PENDING_CLOSE_DIR } from '../specs/shared/api-close-account';

/**
 * Closes the accounts whose teardown was deferred because their Atomic site was
 * still deprovisioning.
 *
 * Cancelling the plan (done in the spec's `afterAll`) starts the deprovision, but
 * the account cannot be closed until it finishes. Waiting for that inside the
 * spec costs the run minutes per Atomic spec and still leaks whenever deprovision
 * outlasts the window. Deferring to here spends the rest of the suite as the wait
 * instead. Anything still blocked becomes a leak marker, so CI reports it exactly
 * as before.
 */
export default async function globalTeardown(): Promise< void > {
	await reapPendingCloses( PENDING_CLOSE_DIR, LEAK_DIR );
}
