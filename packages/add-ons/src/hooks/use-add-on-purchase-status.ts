import { useTranslate } from 'i18n-calypso';

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
export const useAddOnPurchaseStatus = (
	productSlug: string,
	isSiteFeature: boolean,
	// TODO: Fix sitePurchase type
	sitePurchases: []
) => {
	const translate = useTranslate();
	const purchased = sitePurchases.find( ( product ) => product.productSlug === productSlug );

	/*
	 * Order matters below:
	 * 	1. Check if purchased first.
	 * 	2. Check if site feature next.
	 * Reason: `siteHasFeature` involves both purchases and plan features.
	 */

	if ( purchased ) {
		return { available: false, text: translate( 'Purchased' ) };
	}

	if ( isSiteFeature ) {
		return { available: false, text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};
