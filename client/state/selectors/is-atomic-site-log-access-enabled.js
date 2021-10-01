import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';

export function isAtomicSiteLogAccessEnabled( state ) {
	return currentUserHasFlag( state, 'calypso_atomic_site_logs' ) || isSupportSession( state );
}
