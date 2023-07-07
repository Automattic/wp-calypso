import { useSelector } from 'react-redux';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

const useIsPlanAvailableForUpgradeCheck = ( { planSlug }: { planSlug: PlanSlug } ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isAvailableForPurchase = useSelector(
		( state ) => !! selectedSiteId && isPlanAvailableForPurchase( state, selectedSiteId, planSlug )
	);

	return isAvailableForPurchase;
};

export default useIsPlanAvailableForUpgradeCheck;
