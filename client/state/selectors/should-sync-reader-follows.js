/**
 * Internal dependencies
 */
import { getReaderFollowsLastSyncTime } from 'state/reader/follows/selectors';
import { isOffline } from 'state/application/selectors';

export const MS_BETWEEN_SYNCS = 1000 * 60 * 60; // one hour

export default function shouldSyncReaderFollows( state ) {
	if ( isOffline( state ) ) {
		return false;
	}

	const lastTime = getReaderFollowsLastSyncTime( state );
	const eligibleTime = lastTime + MS_BETWEEN_SYNCS;
	return Date.now() > eligibleTime;
}
