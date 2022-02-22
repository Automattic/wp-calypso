import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForGoogleFreeTrial( domain: ResponseDomain ) {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
