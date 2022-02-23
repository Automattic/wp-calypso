import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { SiteDomain } from 'calypso/state/sites/domains/types';

export function isDomainEligibleForGoogleWorkspaceFreeTrial(
	domain: ResponseDomain | SiteDomain | undefined
): boolean {
	return domain?.googleAppsSubscription?.isEligibleForIntroductoryOffer ?? false;
}
