import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForGoogleWorkspaceIntroductoryOffer(
	domain?: ResponseDomain
): boolean {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
