import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines whether a domain can be set as the primary domain for a site.
 * Returns false if any of the following are true:
 * - The user is in a multi-site management context (`isManagingAllSites`)
 * - The domain object is falsy
 * - The domain lacks the `canSetAsPrimary` server-side permission flag
 * - The domain is already the primary domain (`isPrimary`)
 * - The current plan must be upgraded before this domain can become primary (`shouldUpgradeToMakePrimary`)
 * - The domain is currently in an aftermarket auction (`aftermarketAuction`)
 */
export function canSetAsPrimary(
	domain: ResponseDomain,
	isManagingAllSites: boolean,
	shouldUpgradeToMakePrimary: boolean
): boolean {
	return (
		! isManagingAllSites &&
		domain &&
		domain.canSetAsPrimary &&
		! domain.isPrimary &&
		! shouldUpgradeToMakePrimary &&
		! domain.aftermarketAuction
	);
}
