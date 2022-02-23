import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

export function getGSuiteExpiryDate(
	domain: ResponseDomain | SiteDomain | undefined
): string | null {
	return domain?.googleAppsSubscription?.expiryDate ?? null;
}
