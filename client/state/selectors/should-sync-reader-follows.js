/**
 * Internal dependencies
 */

import getReaderFollowsLastSyncTime from 'state/selectors/get-reader-follows-last-sync-time';

export const MS_BETWEEN_SYNCS = 1000 * 60 * 60; // one hour

export default function shouldSyncReaderFollows( state ) {
	const lastTime = getReaderFollowsLastSyncTime( state );
	const eligibleTime = lastTime + MS_BETWEEN_SYNCS;
	return Date.now() > eligibleTime;
}
