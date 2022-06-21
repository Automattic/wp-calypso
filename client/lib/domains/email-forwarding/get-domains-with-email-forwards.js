import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';

/**
 * Retrieve a list domains that have forwards
 *
 * @param {import('calypso/lib/domains/types').ResponseDomain[]} domains Domains to filter
 * @returns {string[]} An array of domain names that have forwards
 */
export function getDomainsWithForwards( domains ) {
	if ( ! domains || ! domains.length ) {
		return [];
	}
	return domains.filter( hasEmailForwards ).map( ( { domain } ) => domain );
}
