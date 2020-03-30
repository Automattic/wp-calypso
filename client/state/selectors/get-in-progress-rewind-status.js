/**
 * Internal dependencies
 */
import getRewindState from './get-rewind-state';

/**
 * Returns the url of a download if it is ready, null otherwise
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {?string} the url of the download, otherwise null
 */
export default function getInProgressRewindStatus( state, siteId ) {
	const maybeRewindState = getRewindState( state, siteId );
	return maybeRewindState.state === 'active' && maybeRewindState.rewind
		? maybeRewindState.rewind.status
		: null;
}
