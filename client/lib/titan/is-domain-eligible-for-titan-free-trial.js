/**
 * @typedef { import("client/lib/domains/types").ResponseDomain } ResponseDomain domain object
 */

/**
 * Determines if the specified domain is eligible for the Titan 3-month free trial.
 *
 * @param {ResponseDomain|undefined} domain - domain object
 * @returns {boolean} whether the domain is eligible or not
 */
export function isDomainEligibleForTitanFreeTrial( domain ) {
	return domain?.titanMailSubscription?.isEligibleForIntroductoryOffer ?? false;
}
