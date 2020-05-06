/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Given a domain object, does that domain have Titan with us.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
function hasTitanWithUs( domain ) {
	const titanStatus = get( domain, 'titanSubscription.status', '' );

	return 'active' === titanStatus;
}

/**
 * Determines whether a user owns a Titan account, given a domain object.
 *
 * @param {object} domain - domain object
 * @param {number} userId - the user id of the user
 * @returns {boolean} - .
 */
function userOwnsTitan( domain, userId ) {
	return get( domain, 'titanSubscription.ownedByUserId' ) === userId;
}

export { hasTitanWithUs, userOwnsTitan };
