import { isDomainEligibleForGoogleWorkspaceIntroductoryOffer } from 'calypso/lib/gsuite/is-domain-eligible-for-google-workspace-introductory-offer';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductIntroductoryOffer } from 'calypso/state/products-list/selectors/get-products-list';

export function isDomainEligibleForGoogleWorkspaceFreeTrial(
	domain?: ResponseDomain,
	introductoryOffer?: ProductIntroductoryOffer
): boolean {
	if ( ! isDomainEligibleForGoogleWorkspaceIntroductoryOffer( domain ) ) {
		return false;
	}

	if ( ! introductoryOffer ) {
		return false;
	}
	return introductoryOffer.cost_per_interval === 0;
}
