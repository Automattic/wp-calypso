import { isRecentlyRegistered } from 'calypso/lib/domains/utils/is-recently-registered';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isRecentlyRegisteredAndDoesNotPointToWpcom( domain: ResponseDomain ): boolean {
	return ! isRecentlyRegistered( domain.registrationDate ) && ! domain.pointsToWpcom;
}
