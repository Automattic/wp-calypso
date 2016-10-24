/**
 * External dependencies
 */
import { get, reduce } from 'lodash';

/**
 * Returns a sync status object by site ID.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Object}          Sync status object
 */
function getSyncStatus( state, siteId ) {
	return get( state, [ 'jetpackSync', 'syncStatus', siteId ] );
}

/**
 * Returns a full sync request object by site ID.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Object}          Full sync request object
 */
function getFullSyncRequest( state, siteId ) {
	return get( state, [ 'jetpackSync', 'fullSyncRequest', siteId ] );
}

/**
 * Returns a boolean for whether a full sync is pending start.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Boolean}         Whether a sync is pending start for site
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
	const requestingFullSync = get( fullSyncRequest, 'isRequesting' ) || get( fullSyncRequest, 'scheduled' );
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
 * Returns a boolean for whether a site is in the process of a full sync.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Boolean}         Whether a sync is in the process of syncing
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
 * Returns a rounded up percentage the amount of sync completed.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Site ID
 * @return {Number}          The percentage of sync completed, expressed as an integer
 */
function getSyncProgressPercentage( state, siteId ) {
	const syncStatus = getSyncStatus( state, siteId ),
		queued = get( syncStatus, 'queue' ),
		sent = get( syncStatus, 'sent' ),
		total = get( syncStatus, 'total' ),
		queuedMultiplier = 0.1,
		sentMultiplier = 0.9;

	if ( isPendingSyncStart( state, siteId ) || ! queued || ! sent || ! total ) {
		return 0;
	}

	const countQueued = reduce( queued, ( sum, value ) => {
		return sum += value;
	}, 0 );

	const countSent = reduce( sent, ( sum, value ) => {
		return sum += value;
	}, 0 );

	const countTotal = reduce( total, ( sum, value ) => {
		return sum += value;
	}, 0 );

	const percentQueued = countQueued / countTotal * queuedMultiplier * 100;
	const percentSent = countSent / countTotal * sentMultiplier * 100;

	return Math.ceil( percentQueued + percentSent );
}

export default {
	getSyncStatus,
	getFullSyncRequest,
	isPendingSyncStart,
	isFullSyncing,
	getSyncProgressPercentage
};
