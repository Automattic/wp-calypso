import { isGoogleWorkspace, isTitanMail } from '@automattic/calypso-products';
import { hasIntroductoryOffer, hasIntroductoryOfferFreeTrial } from 'calypso/lib/emails';
import { isDomainEligibleForGoogleWorkspaceIntroductoryOffer } from 'calypso/lib/gsuite';
import { isDomainEligibleForTitanIntroductoryOffer } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

type DomainIntroductoryOfferEligibilitiesProps = {
	domain?: ResponseDomain;
	isDomainInCart?: boolean;
	product: ProductListItem | null;
};

type DomainIntroductoryOfferEligibilities = {
	isEligibleForIntroductoryOffer: boolean;
	isEligibleForIntroductoryOfferFreeTrial: boolean;
};

const DEFAULT_ELIGIBILITY: DomainIntroductoryOfferEligibilities = {
	isEligibleForIntroductoryOffer: false,
	isEligibleForIntroductoryOfferFreeTrial: false,
};

const useGetDomainIntroductoryOfferEligibilities = ( {
	domain = undefined,
	isDomainInCart = false,
	product,
}: DomainIntroductoryOfferEligibilitiesProps ) => {
	if ( ! product ) {
		return DEFAULT_ELIGIBILITY;
	}

	const isTitanMailProduct = isTitanMail( product );

	if ( ! isTitanMailProduct && ! isGoogleWorkspace( product ) ) {
		return DEFAULT_ELIGIBILITY;
	}

	const isDomainEligibleForIntroductoryOffer = isTitanMailProduct
		? isDomainEligibleForTitanIntroductoryOffer( domain )
		: isDomainEligibleForGoogleWorkspaceIntroductoryOffer( domain );

	const isEligibleForIntroductoryOffer = domain
		? isDomainEligibleForIntroductoryOffer
		: isDomainInCart && hasIntroductoryOffer( product );

	const isEligibleForIntroductoryOfferFreeTrial =
		isEligibleForIntroductoryOffer && hasIntroductoryOfferFreeTrial( product );

	return { isEligibleForIntroductoryOffer, isEligibleForIntroductoryOfferFreeTrial };
};

export default useGetDomainIntroductoryOfferEligibilities;
