/**
 * External dependencies
 */
import { get } from 'lodash';

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

export default {
	getSyncStatus,
	getFullSyncRequest,
	isPendingSyncStart
};
