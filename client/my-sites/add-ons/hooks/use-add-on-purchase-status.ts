import {
	WPCOM_FEATURES_NO_ADVERTS,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_UNLIMITED_THEMES,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getFeatureFromProduct from '../utils/get-feature-from-product';

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( addOnProductSlug: string ) => {
	const translate = useTranslate();
	const { purchased, isSiteFeature } = useSelector( ( state ) => {
		const selectedSite = getSelectedSite( state );
		const sitePurchases = getSitePurchases( state, selectedSite?.ID );
		const addOnFeatureSlug = getFeatureFromProduct( addOnProductSlug );

		return {
			purchased:
				sitePurchases.filter( ( product ) => product.productSlug === addOnProductSlug ).length > 0,
			isSiteFeature: selectedSite && siteHasFeature( state, selectedSite?.ID, addOnFeatureSlug ),
		};
	} );

	if ( purchased ) {
		return {
			available: false,
			text: translate( 'Purchased' ),
		};
	}

	switch ( addOnProductSlug ) {
		case WPCOM_FEATURES_NO_ADVERTS:
		case WPCOM_FEATURES_CUSTOM_DESIGN:
		case WPCOM_FEATURES_UNLIMITED_THEMES:
			if ( isSiteFeature ) {
				return { available: false, text: translate( 'Included in your plan' ) };
			}
		default:
			return { available: true };
	}
};

export default useAddOnPurchaseStatus;
