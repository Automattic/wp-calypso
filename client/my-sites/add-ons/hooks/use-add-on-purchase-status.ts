import { WPCOM_FEATURES_NO_ADVERTS } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Returns whether add-on product has been purchased (either directly or included in selected site plan).
 */
const useAddOnPurchaseStatus = ( addOnSlug: string ) => {
	const selectedSite = useSelector( getSelectedSite );
	const sitePurchases = useSelector( ( state ) => {
		return getSitePurchases( state, selectedSite?.ID );
	} );
	const isPaidPlan = useSelector(
		( state ) => selectedSite && isSiteOnPaidPlan( state, selectedSite?.ID )
	);

	switch ( addOnSlug ) {
		case WPCOM_FEATURES_NO_ADVERTS:
			if ( isPaidPlan ) {
				return true;
			}
		default:
			return sitePurchases.filter( ( product ) => product.productSlug === addOnSlug ).length > 0;
	}
};

export default useAddOnPurchaseStatus;
