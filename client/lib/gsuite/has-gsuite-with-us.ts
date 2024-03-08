import { getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite/get-gsuite-subscription-status';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Given a domain object, does that domain have G Suite with us.
 * @returns {boolean} - true if the domain is under our management, false otherwise
 */
export function hasGSuiteWithUs( domain: ResponseDomain | undefined ): boolean {
	const status = getGSuiteSubscriptionStatus( domain );

	return ! [ '', 'no_subscription', 'other_provider' ].includes( status );
}
