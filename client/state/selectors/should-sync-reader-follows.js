/**
 * Internal dependencies
 */
import { getReaderFollowsLastSyncTime } from 'calypso/state/reader/follows/selectors';

export const MS_BETWEEN_SYNCS = 1000 * 60 * 60; // one hour

export default function shouldSyncReaderFollows( state ) {
	const lastTime = getReaderFollowsLastSyncTime( state );
	const eligibleTime = lastTime + MS_BETWEEN_SYNCS;
	return Date.now() > eligibleTime;
}
