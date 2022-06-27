import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getFeatureSlug from '../utils/get-feature-slug';

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( addOnProductSlug: string ) => {
	const translate = useTranslate();
	const { purchased, isSiteFeature } = useSelector( ( state ) => {
		const selectedSite = getSelectedSite( state );
		const sitePurchases = getSitePurchases( state, selectedSite?.ID );
		const addOnFeatureSlug = getFeatureSlug( addOnProductSlug );
		return {
			purchased:
				sitePurchases.filter( ( product ) => product.productSlug === addOnProductSlug ).length > 0,
			isSiteFeature:
				selectedSite &&
				addOnFeatureSlug &&
				siteHasFeature( state, selectedSite?.ID, addOnFeatureSlug ),
		};
	} );

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

export default useAddOnPurchaseStatus;
