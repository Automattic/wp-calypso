import { WPCOM_FEATURES_NO_ADVERTS } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Returns whether add-on product has been purchased (either directly or included in selected site plan).
 */
const useAddOnPurchaseStatus = ( addOnSlug: string ) => {
	const { sitePurchases, isSiteFeature } = useSelector( ( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			sitePurchases: getSitePurchases( state, selectedSite?.ID ),
			isSiteFeature: selectedSite && siteHasFeature( state, selectedSite?.ID, addOnSlug ),
		};
	} );

	switch ( addOnSlug ) {
		case WPCOM_FEATURES_NO_ADVERTS:
			if ( isSiteFeature ) {
				return true;
			}
		default:
			return sitePurchases.filter( ( product ) => product.productSlug === addOnSlug ).length > 0;
	}
};

export default useAddOnPurchaseStatus;
