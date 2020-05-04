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

export { hasTitanWithUs };
