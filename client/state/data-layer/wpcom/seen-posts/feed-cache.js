import { patchFeedUnseenCounts, restoreFeedCache } from 'calypso/reader/data/feed';
import { getCalypsoQueryClient } from 'calypso/state/query-client';

const rollbackSnapshots = new Map();
const actionSnapshotIds = new WeakMap();
let nextSnapshotId = 0;

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

const takeFeedSeenOptimisticSnapshot = ( action ) => {
	const snapshotKey = getSnapshotKey( action );
	const snapshots = rollbackSnapshots.get( snapshotKey );
	if ( ! snapshots?.length ) {
		return;
	}

	const snapshotId = actionSnapshotIds.get( action );
	const snapshotIndex = snapshotId
		? snapshots.findIndex( ( entry ) => entry.snapshotId === snapshotId )
		: snapshots.length - 1;
	const [ entry ] = snapshots.splice(
		snapshotIndex >= 0 ? snapshotIndex : snapshots.length - 1,
		1
	);

	if ( snapshots.length > 0 ) {
		rollbackSnapshots.set( snapshotKey, snapshots );
	} else {
		rollbackSnapshots.delete( snapshotKey );
	}
	actionSnapshotIds.delete( action );

	return entry?.snapshot;
};

export const applyFeedSeenOptimisticUpdate = ( action, patch ) => {
	const queryClient = getCalypsoQueryClient();
	if ( ! queryClient ) {
		return;
	}

	const snapshot = patchFeedUnseenCounts( queryClient, patch );
	if ( snapshot.length > 0 ) {
		const snapshotKey = getSnapshotKey( action );
		const snapshotId = ++nextSnapshotId;
		const snapshots = rollbackSnapshots.get( snapshotKey ) ?? [];
		snapshots.push( { snapshotId, snapshot } );
		rollbackSnapshots.set( snapshotKey, snapshots );
		actionSnapshotIds.set( action, snapshotId );
	}
};

export const keepFeedSeenOptimisticUpdate = ( action ) => {
	takeFeedSeenOptimisticSnapshot( action );
};

export const rollbackFeedSeenOptimisticUpdate = ( action ) => {
	const queryClient = getCalypsoQueryClient();
	const snapshot = takeFeedSeenOptimisticSnapshot( action );
	if ( queryClient && snapshot ) {
		restoreFeedCache( queryClient, snapshot );
	}
};
