import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if the specified domain is eligible for the Google 1-month free trial.
 *
 * @param {ResponseDomain|undefined} domain - domain object
 * @returns {boolean} whether the domain is eligible or not
 */
export function isDomainEligibleForGoogleFreeTrial( domain: ResponseDomain ) {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
