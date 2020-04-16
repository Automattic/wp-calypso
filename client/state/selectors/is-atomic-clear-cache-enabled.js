/**
 * Internal dependencies
 */
import { isSupportSession } from 'state/support/selectors';
import { currentUserHasFlag } from 'state/current-user/selectors';

export function isAtomicClearCacheEnabled( state ) {
	return currentUserHasFlag( state, 'calypso_atomic_clear_cache' ) || isSupportSession( state );
}
