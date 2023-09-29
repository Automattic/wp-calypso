import { createSelector } from '@automattic/state-utils';
import { useSelector } from 'react-redux';
import { getSitePlan } from 'calypso/state/sites/plans/selectors';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlugs: PlanSlug[];
}

type PlanUpgradeability = {
	[ planSlug in PlanSlug ]: boolean;
};

const getPlanUpgradeability = createSelector(
	( state, planSlugs: PlanSlug[] ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return planSlugs.reduce( ( acc, planSlug ) => {
			return {
				...acc,
				[ planSlug ]:
					!! selectedSiteId && isPlanAvailableForPurchase( state, selectedSiteId, planSlug ),
			};
		}, {} as PlanUpgradeability );
	},
	( state, planSlugs: PlanSlug[] ) => [
		getSelectedSiteId( state ),
		getSitePlan( state, getSelectedSiteId( state ) ),
		planSlugs,
	]
);

const usePlanUpgradeabilityCheck = ( { planSlugs }: Props ): PlanUpgradeability => {
	return useSelector( ( state ) => getPlanUpgradeability( state, planSlugs ) );
};

export default usePlanUpgradeabilityCheck;
