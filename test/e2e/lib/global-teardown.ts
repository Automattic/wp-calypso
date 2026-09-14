import { reapPendingCloses } from '@automattic/calypso-e2e';
import { LEAK_DIR, PENDING_CLOSE_DIR } from '../specs/shared/api-close-account';

export default async function globalTeardown(): Promise< void > {
	// Closes the accounts whose close was deferred because their Atomic site was
	// still deprovisioning. Waiting that out in each spec's `afterAll` costs
	// minutes per Atomic spec; here the rest of the suite has served as the wait.
	await reapPendingCloses( PENDING_CLOSE_DIR, LEAK_DIR );
}
