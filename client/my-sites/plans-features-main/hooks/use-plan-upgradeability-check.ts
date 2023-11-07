import { useSelector } from 'react-redux';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlugs: PlanSlug[];
	sitePlanSlug: PlanSlug | null;
}

type PlanUpgradeability = {
	[ planSlug in PlanSlug ]: boolean;
};

const usePlanUpgradeabilityCheck = ( { planSlugs, sitePlanSlug }: Props ): PlanUpgradeability => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const planUpgradeability = useSelector( ( state ) => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			return {
				...acc,
				[ planSlug ]:
					! sitePlanSlug ||
					( !! selectedSiteId && isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) ),
			};
		}, {} as PlanUpgradeability );
	} );

	return planUpgradeability;
};

export default usePlanUpgradeabilityCheck;
