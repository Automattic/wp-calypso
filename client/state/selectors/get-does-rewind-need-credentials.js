import {
	hasJetpackCredentials,
	areJetpackCredentialsInvalid,
} from 'calypso/state/jetpack/credentials/selectors';
import { getPreflightStatus } from 'calypso/state/rewind/preflight/selectors';
import { PreflightTestStatus } from 'calypso/state/rewind/preflight/types';

/**
 * Determines whether the Jetpack Backup feature requires credentials for a given site.
 * This function evaluates the necessity of credentials based on two factors:
 * the preflight status and the state of the credentials (whether they exist and are valid).
 *
 * The function returns true in the following scenarios:
 * - The site does not have credentials and the preflight status is failed. This implies
 * that credentials are needed and must be provided for restores to function properly.
 * - The site has credentials but they are invalid, and the preflight status is failed.
 * This suggests that the existing credentials are not correct or have issues, and
 * new valid credentials are required.
 *
 * In all other cases, the function returns false, indicating that either the credentials
 * are valid or that the preflight status does not need credentials.
 * @param {Object} state         - The current state object of the application.
 * @param {number|string} siteId - The unique identifier for the site being evaluated.
 * @returns {boolean}            - Returns true if it requires credentials for the site under
 *                                 the specified conditions; otherwise, returns false.
 */
export default function getDoesRewindNeedCredentials( state, siteId ) {
	const preflightStatus = getPreflightStatus( state, siteId );
	const hasCredentials = hasJetpackCredentials( state, siteId );
	const areCredentialsInvalid = areJetpackCredentialsInvalid( state, siteId, 'main' );

	if ( ! hasCredentials && preflightStatus === PreflightTestStatus.FAILED ) {
		return true;
	}

	if ( hasCredentials && areCredentialsInvalid && preflightStatus === PreflightTestStatus.FAILED ) {
		return true;
	}

	return false;
}
