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

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( addOnSlug: string ) => {
	const translate = useTranslate();
	const { purchased, isSiteFeature } = useSelector( ( state ) => {
		const selectedSite = getSelectedSite( state );
		const sitePurchases = getSitePurchases( state, selectedSite?.ID );

		return {
			purchased:
				sitePurchases.filter( ( product ) => product.productSlug === addOnSlug ).length > 0,
			isSiteFeature: selectedSite && siteHasFeature( state, selectedSite?.ID, addOnSlug ),
		};
	} );

	if ( purchased ) {
		return {
			selected: true,
			text: translate( 'Purchased' ),
		};
	}

	switch ( addOnSlug ) {
		case WPCOM_FEATURES_NO_ADVERTS:
		case WPCOM_FEATURES_CUSTOM_DESIGN:
		case WPCOM_FEATURES_UNLIMITED_THEMES:
			if ( isSiteFeature ) {
				return { selected: true, text: translate( 'Included in your plan' ) };
			}
		default:
			return { selected: false };
	}
};

export default useAddOnPurchaseStatus;
