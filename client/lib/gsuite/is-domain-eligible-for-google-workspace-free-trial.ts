import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForGoogleWorkspaceFreeTrial(
	domain: ResponseDomain | undefined
): boolean {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
