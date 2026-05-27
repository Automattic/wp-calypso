import { patchFeedUnseenCounts, restoreFeedCache } from 'calypso/reader/data/feed';
import { getCalypsoQueryClient } from 'calypso/state/query-client';

const rollbackSnapshots = new Map();

const getSnapshotKey = ( action ) =>
	JSON.stringify( {
		type: action.type,
		feedId: action.feedId,
		feedUrl: action.feedUrl,
		feedIds: action.feedIds,
		feedUrls: action.feedUrls,
		globalIds: action.globalIds,
		feedItemIds: action.feedItemIds,
		postIds: action.postIds,
		identifier: action.identifier,
	} );

export const applyFeedSeenOptimisticUpdate = ( action, patch ) => {
	const queryClient = getCalypsoQueryClient();
	if ( ! queryClient ) {
		return;
	}

	const snapshot = patchFeedUnseenCounts( queryClient, patch );
	if ( snapshot.length > 0 ) {
		rollbackSnapshots.set( getSnapshotKey( action ), snapshot );
	}
};

export const keepFeedSeenOptimisticUpdate = ( action ) => {
	rollbackSnapshots.delete( getSnapshotKey( action ) );
};

export const rollbackFeedSeenOptimisticUpdate = ( action ) => {
	const queryClient = getCalypsoQueryClient();
	const snapshotKey = getSnapshotKey( action );
	const snapshot = rollbackSnapshots.get( snapshotKey );
	if ( queryClient && snapshot ) {
		restoreFeedCache( queryClient, snapshot );
	}
	rollbackSnapshots.delete( snapshotKey );
};
