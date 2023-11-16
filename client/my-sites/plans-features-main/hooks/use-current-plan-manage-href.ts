import { useSelector } from 'react-redux';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const useCurrentPlanManageHref = () => {
	const siteId = useSelector( getSelectedSiteId );
	const purchaseId = useSelector( ( state: IAppState ) =>
		siteId ? getCurrentPlanPurchaseId( state, siteId ) : null
	);
	const selectedSiteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );

	return purchaseId && selectedSiteSlug
		? getManagePurchaseUrlFor( selectedSiteSlug, purchaseId )
		: `/plans/my-plan/${ siteId }`;
};

export default useCurrentPlanManageHref;
