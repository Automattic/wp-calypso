import { useSelector } from 'react-redux';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useCurrentPlanManageHref = ( siteId?: number ) => {
	const selectedSiteId = useSelector( getSelectedSiteId ) || siteId;
	const purchaseId = useSelector( ( state: IAppState ) =>
		selectedSiteId ? getCurrentPlanPurchaseId( state, selectedSiteId ) : null
	);
	const selectedSiteSlug = useSelector( ( state: IAppState ) =>
		getSiteSlug( state, selectedSiteId )
	);

	return purchaseId && selectedSiteSlug
		? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
		: `/plans/my-plan/${ selectedSiteId }`;
};

export default useCurrentPlanManageHref;
