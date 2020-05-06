/**
 * Internal dependencies
 */
import { hasGSuiteWithUs, userOwnsGSuite } from 'lib/gsuite';
import { hasTitanWithUs, userOwnsTitan } from 'lib/titan';
import { PROVIDER_GSUITE, PROVIDER_TITAN } from './constants';

/**
 * Given a domain object, does that domain have email with us, with any of our providers.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
function hasEmailWithUs( domain ) {
	return hasGSuiteWithUs( domain ) || hasTitanWithUs( domain );
}

/**
 * Determines whether a user owns a G Suite account, given a domain object.
 *
 * @param {string} provider - the email provider
 * @param {object} domain - domain object
 * @param {number} userId - the user id of the user
 * @returns {boolean} - .
 */
function userOwnsEmail( provider, domain, userId ) {
	if ( PROVIDER_GSUITE === provider ) {
		return userOwnsGSuite( domain, userId );
	}
	if ( PROVIDER_TITAN === provider ) {
		return userOwnsTitan( domain, userId );
	}
	return false;
}

export { hasEmailWithUs, userOwnsEmail };
