import { hasIntroductoryOfferFreeTrial } from 'calypso/lib/emails';
import { isDomainEligibleForGoogleWorkspaceIntroductoryOffer } from 'calypso/lib/gsuite';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

export function isDomainEligibleForGoogleWorkspaceFreeTrial( {
	domain,
	product,
}: {
	domain?: ResponseDomain;
	product: ProductListItem | null;
} ): boolean {
	if ( ! isDomainEligibleForGoogleWorkspaceIntroductoryOffer( domain ) ) {
		return false;
	}

	return hasIntroductoryOfferFreeTrial( product );
}
