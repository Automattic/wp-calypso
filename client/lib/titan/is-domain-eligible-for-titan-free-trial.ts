import { hasIntroductoryOfferFreeTrial } from 'calypso/lib/emails';
import { isDomainEligibleForTitanIntroductoryOffer } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export function isDomainEligibleForTitanFreeTrial( {
	domain,
	product,
}: {
	domain?: ResponseDomain;
	product: ProductListItem | null;
} ): boolean {
	if ( ! isDomainEligibleForTitanIntroductoryOffer( domain ) ) {
		return false;
	}

	return hasIntroductoryOfferFreeTrial( product );
}
