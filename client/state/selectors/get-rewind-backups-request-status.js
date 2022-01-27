import 'calypso/state/rewind/init';

/**
 * Get the status of the rewind backups request.
 *
 * @param {object} state Global state tree
 * @param {number|null} siteId the site ID
 * @returns {string|null} The backup request status
 */
export default function getRewindBackupsRequestStatus( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}
	return state.rewind?.[ siteId ]?.backups?.requestStatus ?? null;
}
