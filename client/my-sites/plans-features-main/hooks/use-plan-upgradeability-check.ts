import { useSelector } from 'react-redux';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlugs: PlanSlug[];
}

type PlanUpgradeability = {
	[ planSlug in PlanSlug ]: boolean;
};

/**
 * Returns a dictionary of plan slugs and whether or not they are available for purchase.
 * Note that if there is no selectedSiteId, then we assume that we are in onboarding or
 * signup, which will, by default, make the plan purchaseable.
 */

// TODO: The term "upgrade" is only relevant in the context of a selected site. Because
// this hook handles situations where both a site is selected and is not selected,
// "upgrade" doesn't make sense. Let's rename this hook to something like
// usePlanAvailabilityCheck, or update the hook to only handle the case where a site is
// selected.
const usePlanUpgradeabilityCheck = ( { planSlugs }: Props ): PlanUpgradeability => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const planUpgradeability = useSelector( ( state ) => {
		return planSlugs.reduce( ( acc, planSlug ) => {
			return {
				...acc,
				[ planSlug ]:
					! selectedSiteId || isPlanAvailableForPurchase( state, selectedSiteId, planSlug ),
			};
		}, {} as PlanUpgradeability );
	} );

	return planUpgradeability;
};

export default usePlanUpgradeabilityCheck;
