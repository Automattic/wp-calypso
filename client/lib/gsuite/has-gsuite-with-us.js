import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite/get-gsuite-subscription-status';

/**
 * Given a domain object, does that domain have G Suite with us.
 *
 * @param {object} domain - domain object
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
export function hasGSuiteWithUs( domain ) {
	const domainStatus = getGSuiteSubscriptionStatus( domain );
	return ! [ '', 'no_subscription', 'other_provider' ].includes( domainStatus );
}
