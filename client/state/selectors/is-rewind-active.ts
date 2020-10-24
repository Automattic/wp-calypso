/**
 * Internal dependencies
 */
import getRewindState from 'calypso/state/selectors/get-rewind-state';

/**
 * Indicates whether the Rewind feature is active
 *
 * @param {object} state Global state tree
 * @param {number|string} siteId the site ID
 * @returns {boolean} true if rewind is active
 */
export default function isRewindActive( state, siteId ): boolean {
	return [ 'awaitingCredentials', 'provisioning', 'active' ].includes(
		getRewindState( state, siteId ).state
	);
}
