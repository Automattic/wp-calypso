import moment from 'moment';

/**
 * Checks if a domain is within the post-expiration grace period.
 * ICANN grants a standard 18-day grace period after the expiry date during
 * which the original registrant can still renew without losing the domain.
 * @param {Object} domain - domain object with an `expiry` date string
 * @returns {boolean} - true if the domain expires/expired within the last 18 days
 */
export function isDomainInGracePeriod( domain ) {
	// 18 days: the ICANN-standard Redemption Grace Period after expiration
	return moment().subtract( 18, 'days' ) <= moment( domain?.expiry );
}
