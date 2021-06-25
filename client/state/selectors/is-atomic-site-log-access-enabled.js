/**
 * Internal dependencies
 */
import { isSupportSession } from 'calypso/state/support/selectors';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';

export function isAtomicSiteLogAccessEnabled( state ) {
	return currentUserHasFlag( state, 'calypso_atomic_site_logs' ) || isSupportSession( state );
}
