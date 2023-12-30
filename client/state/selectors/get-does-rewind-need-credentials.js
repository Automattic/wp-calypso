import { getPreflightStatus } from 'calypso/state/rewind/preflight/selectors';
import { PreflightTestStatus } from 'calypso/state/rewind/preflight/types';
import getRewindState from 'calypso/state/selectors/get-rewind-state';

/**
 * Returns true if the rewind state is awaiting credentials and the preflight test has failed.
 * @param {Object} state - Global state tree
 * @param {number|string} siteId - The unique identifier for the site
 * @returns {boolean} Returns true if the rewind functionality is in the 'awaitingCredentials' state
 *                    and the preflight test has failed. Otherwise, returns false.
 */
export default function getDoesRewindNeedCredentials( state, siteId ) {
	const preflightStatus = getPreflightStatus( state, siteId );
	const rewindState = getRewindState( state, siteId ).state;
	return preflightStatus === PreflightTestStatus.FAILED && rewindState === 'awaitingCredentials';
}
