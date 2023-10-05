import { ResponseDomain } from './types';

export function canSetAsPrimary(
	domain: ResponseDomain,
	shouldUpgradeToMakePrimary: boolean
): boolean {
	return (
		domain &&
		domain.canSetAsPrimary &&
		! domain.isPrimary &&
		! shouldUpgradeToMakePrimary &&
		! domain.aftermarketAuction
	);
}
