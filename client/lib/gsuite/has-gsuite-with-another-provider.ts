import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite/get-gsuite-subscription-status';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

/**
 * Given a domain object, does that domain have G Suite with another provider.
 *
 * @returns {boolean} - true if the domain is with another provider, false otherwise
 */
export function hasGSuiteWithAnotherProvider(
	domain: ResponseDomain | SiteDomain | undefined
): boolean {
	const status = getGSuiteSubscriptionStatus( domain );

	return 'other_provider' === status;
}
