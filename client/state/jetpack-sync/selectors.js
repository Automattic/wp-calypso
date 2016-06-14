/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns a sync status object by site ID.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Post global ID
 * @return {Object}          Sync status object
 */
function getSyncStatus( state, siteId ) {
	return get( state, [ 'jetpackSync', 'syncStatus', siteId ] );
}

/**
 * Returns a full sync request object by site ID.
 * @param  {Object} state    Global state tree
 * @param  {Number} siteId   Post global ID
 * @return {Object}          Full sync request object
 */
function getFullSyncRequest( state, siteId ) {
	return get( state, [ 'jetpackSync', 'fullSyncRequest', siteId ] );
}

export default {
	getSyncStatus,
	getFullSyncRequest
};
