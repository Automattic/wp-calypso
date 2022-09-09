import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if email can be added to the provided domain.
 * Additional checks are not performed for existing email subscriptions
 */
export function canCurrentUserAddEmail( domain: ResponseDomain | undefined ) {
	return !! domain?.currentUserCanAddEmail;
}
