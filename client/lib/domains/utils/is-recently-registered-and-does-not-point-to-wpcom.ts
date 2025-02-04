import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Checks if the domain was registered recently and does not point to WPCOM.
 * @param domain
 * @returns boolean
 */
export function isRecentlyRegisteredAndDoesNotPointToWpcom( domain: ResponseDomain ): boolean {
	return isRecentlyRegistered( domain.registrationDate ) && ! domain.pointsToWpcom;
}
