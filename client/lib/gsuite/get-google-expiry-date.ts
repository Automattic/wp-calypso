import type { ResponseDomain } from 'calypso/lib/domains/types';

export function getGoogleExpiryDate( domain: ResponseDomain ): string | null {
	return domain.googleAppsSubscription?.expiryDate ?? null;
}
