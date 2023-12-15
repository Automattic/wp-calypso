import { Plans } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlugs: PlanSlug[];
}

type PlanAvailabilityForPurchase = {
	[ planSlug in PlanSlug ]: boolean;
};

/**
 * Returns a dictionary of plan slugs and whether or not they are available for purchase.
 * Note that:
 * - If there is not current-plan or selected-site defined, then plan is marked as purchasable.
 * This would be the equivalent of an Onboarding/Signup context, where no other conditions currently apply.
 * - If a selected site exists, then we check if the plan is available for purchase on that site.
 */
const useCheckPlanAvailabilityForPurchase = ( {
	planSlugs,
}: Props ): PlanAvailabilityForPurchase => {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const currentPlan = Plans.useCurrentPlan( { siteId: selectedSiteId } );

	return useSelector( ( state ) =>
		Object.fromEntries(
			planSlugs.map( ( planSlug ) => {
				// 1. No selected site or current plan: plan is in a context-free state and is available for purchase
				if ( ! selectedSiteId || ! currentPlan ) {
					return [ planSlug, true ];
				}

				// 2. Otherwise, check if the plan is available for purchase on the selected site
				return [ planSlug, isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) ];
			} )
		)
	);
};

export default useCheckPlanAvailabilityForPurchase;
