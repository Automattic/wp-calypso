import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite/get-gsuite-subscription-status';

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is with another provider, false otherwise
 */
export function hasGSuiteWithAnotherProvider( domain ) {
	const domainStatus = getGSuiteSubscriptionStatus( domain );

	return 'other_provider' === domainStatus;
}
