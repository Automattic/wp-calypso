import { isDomainEligibleForTitanIntroductoryOffer } from 'calypso/lib/titan/is-domain-eligible-for-titan-introductory-offer';
import { ProductIntroductoryOffer } from 'calypso/state/products-list/selectors/get-products-list';
import type { ResponseDomain } from 'calypso/lib/domains/types';

export function isDomainEligibleForTitanFreeTrial(
	domain?: ResponseDomain,
	introductoryOffer?: ProductIntroductoryOffer
): boolean {
	if ( ! isDomainEligibleForTitanIntroductoryOffer( domain ) ) {
		return false;
	}

	if ( ! introductoryOffer ) {
		return false;
	}
	return introductoryOffer.cost_per_interval === 0;
}
