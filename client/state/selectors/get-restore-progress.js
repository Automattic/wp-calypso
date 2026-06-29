import 'calypso/state/activity-log/init';

/**
 * Returns the progress of a restore request
 * @param {Object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?Object} Progress object, null if no data
 */
export default function getRestoreProgress( state, siteId ) {
	return state?.activityLog?.restoreProgress?.[ siteId ] ?? null;
}
