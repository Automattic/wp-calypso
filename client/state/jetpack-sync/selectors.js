/**
 * External dependencies
 */
import { get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/jetpack-sync/init';

/**
 * Returns a sync status object by site ID.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {object}          Sync status object
 */
function getSyncStatus( state, siteId ) {
	return get( state, [ 'jetpackSync', 'syncStatus', siteId ] );
}

/**
 * Returns a full sync request object by site ID.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {object}          Full sync request object
 */
function getFullSyncRequest( state, siteId ) {
	return get( state, [ 'jetpackSync', 'fullSyncRequest', siteId ] );
}

/**
 * Returns a boolean for whether a full sync is pending start.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {boolean}         Whether a sync is pending start for site
 */
function isPendingSyncStart( state, siteId ) {
	const syncStatus = getSyncStatus( state, siteId );
	const fullSyncRequest = getFullSyncRequest( state, siteId );

	// Is the sync scheduled and awaiting cron?
	const isScheduled = get( syncStatus, 'is_scheduled' );
	if ( isScheduled ) {
		return true;
	}

	// Have we requested a full sync from Calypso?
	const requestingFullSync =
		get( fullSyncRequest, 'isRequesting' ) || get( fullSyncRequest, 'scheduled' );
	if ( ! requestingFullSync ) {
		return false;
	}

	// If we have requested a full sync, is that request newer than the last time we received sync status?
	const lastRequested = get( fullSyncRequest, 'lastRequested' );
	const lastSuccessfulStatus = get( syncStatus, 'lastSuccessfulStatus' );

	if ( ! lastSuccessfulStatus ) {
		return true;
	}

	return parseInt( lastRequested, 10 ) > parseInt( lastSuccessfulStatus, 10 );
}

/**
 * Sites on Jetpack 8.2 may be using an immediate full sync.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {boolean}        Whether a site is using immediate full sync
 */
function isImmediateFullSync( state, siteId ) {
	const syncStatus = getSyncStatus( state, siteId );
	return ! get( syncStatus, 'queue' ); // Immediate full sync sites will not have a `queue` property.
}

/**
 * Returns a rounded up percentage the amount of sync completed for sites using immediate full sync.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {number}         The percentage of sync completed, expressed as an integer
 */
function getImmediateSyncProgressPercentage( state, siteId ) {
	const syncStatus = getSyncStatus( state, siteId );
	const progress = get( syncStatus, 'progress' );

	if ( ! progress ) {
		return 0;
	}
	const totalItems = reduce(
		Object.values( progress ),
		( sum, syncItem ) => {
			return syncItem.total ? ( sum += parseInt( syncItem.total ) ) : sum;
		},
		0
	);
	const totalSent = reduce(
		Object.values( progress ),
		( sum, syncItem ) => {
			return syncItem.sent ? ( sum += parseInt( syncItem.sent ) ) : sum;
		},
		0
	);
	return Math.ceil( ( totalSent / totalItems ) * 100 );
}

/**
 * Returns a boolean for whether a site is in the process of a full sync.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {boolean}         Whether a sync is in the process of syncing
 */
function isFullSyncing( state, siteId ) {
	const syncStatus = getSyncStatus( state, siteId );
	if ( ! syncStatus ) {
		return false;
	}

	const isStarted = get( syncStatus, 'started' );
	const isFinished = get( syncStatus, 'finished' );

	return isStarted && ! isFinished;
}

/**
 * Returns a rounded up percentage the amount of sync completed for sites using legacy full sync.
 *
 * @param  {object} state    Global state tree
 * @param  {number} siteId   Site ID
 * @returns {number}          The percentage of sync completed, expressed as an integer
 */
function getSyncProgressPercentage( state, siteId ) {
	if ( isImmediateFullSync( state, siteId ) ) {
		return getImmediateSyncProgressPercentage( state, siteId );
	}

	const syncStatus = getSyncStatus( state, siteId );
	const queued = get( syncStatus, 'queue' );
	const sent = get( syncStatus, 'sent' );
	const total = get( syncStatus, 'total' );
	const queuedMultiplier = 0.1;
	const sentMultiplier = 0.9;

	if ( isPendingSyncStart( state, siteId ) || ! queued || ! sent || ! total ) {
		return 0;
	}

	const countQueued = reduce(
		queued,
		( sum, value ) => {
			return ( sum += value );
		},
		0
	);

	const countSent = reduce(
		sent,
		( sum, value ) => {
			return ( sum += value );
		},
		0
	);

	const countTotal = reduce(
		total,
		( sum, value ) => {
			return ( sum += value );
		},
		0
	);

	const percentQueued = ( countQueued / countTotal ) * queuedMultiplier * 100;
	const percentSent = ( countSent / countTotal ) * sentMultiplier * 100;
	return Math.ceil( percentQueued + percentSent );
}

export default {
	getSyncStatus,
	getFullSyncRequest,
	isPendingSyncStart,
	isFullSyncing,
	getSyncProgressPercentage,
	isImmediateFullSync,
};
