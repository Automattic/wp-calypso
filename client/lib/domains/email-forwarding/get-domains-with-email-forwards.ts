import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Retrieve a list domains that have forwards
 * @param domains Domains to filter
 * @returns An array of domain names that have forwards
 */
export function getDomainsWithEmailForwards( domains: ResponseDomain[] ): string[] {
	if ( ! domains ) {
		return [];
	}
	return domains.filter( hasEmailForwards ).map( ( { domain } ) => domain );
}
