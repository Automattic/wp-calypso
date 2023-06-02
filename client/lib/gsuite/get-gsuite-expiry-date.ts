import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getGSuiteExpiryDate( domain: ResponseDomain | undefined ): string | null {
	return domain?.googleAppsSubscription?.expiryDate ?? null;
}
