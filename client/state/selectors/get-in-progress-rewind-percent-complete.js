/**
 * Internal dependencies
 */
import getRewindState from './get-rewind-state';

/**
 * Returns the url of a download if it is ready, null otherwise
 *
 * @param {object} state Global state tree
 * @param {?number|string} siteId the site ID
 * @returns {number} the url of the download, otherwise null
 */
export default function getInProgressRewindPercentComplete( state, siteId ) {
	const maybeRewindState = getRewindState( state, siteId );
	return maybeRewindState.state === 'active' &&
		maybeRewindState.rewind &&
		maybeRewindState.rewind.hasOwnProperty( 'progress' )
		? maybeRewindState.rewind.progress
		: 0;
}
