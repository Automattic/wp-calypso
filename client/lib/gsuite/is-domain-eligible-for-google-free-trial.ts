import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForGoogleWorkspaceFreeTrial( domain: ResponseDomain ) {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
