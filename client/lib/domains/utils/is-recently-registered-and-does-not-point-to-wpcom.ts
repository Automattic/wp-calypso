import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Checks if the domain was registered recently (less than 24 hours ago) and does not
 * point to WPCOM.
 *
 * @param domain
 * @returns boolean
 */
export function isRecentlyRegisteredAndDoesNotPointToWpcom( domain: ResponseDomain ): boolean {
	const DAY_IN_MINUTES = 24 * 60;
	return isRecentlyRegistered( domain.registrationDate, DAY_IN_MINUTES ) && ! domain.pointsToWpcom;
}
