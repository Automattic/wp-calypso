import type { ResponseDomain } from 'calypso/lib/domains/types';

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
