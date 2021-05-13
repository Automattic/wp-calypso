/**
 * Internal dependencies
 */
import { getEmailForwardsCount } from 'calypso/lib/domains/email-forwarding/get-email-forwards-count';

/**
 * @param domain A domain object returned from the domains REST API
 * @returns {boolean} Whether the doamin has any email forwards.
 */
export function hasEmailForwards( domain ) {
	return getEmailForwardsCount( domain ) > 0;
}
