/**
 * Internal dependencies
 */
import getRewindState from './get-rewind-state';

/**
 * Returns the url of a download if it is ready, null otherwise
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @param {string} rewindId the id of the rewind to get the status of
 * @returns {?string} the url of the download, otherwise null
 */
export default function getInProgressRewindStatus( state, siteId, rewindId ) {
	const maybeRewindState = getRewindState( state, siteId );
	return maybeRewindState.state === 'active' &&
		maybeRewindState.rewind &&
		maybeRewindState.rewind.rewindId === rewindId
		? maybeRewindState.rewind.status
		: null;
}
