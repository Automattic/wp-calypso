import { Plans } from '@automattic/data-stores';
import { shallowEqual, useSelector } from 'react-redux';
import canUpgradeToPlan from 'calypso/state/selectors/can-upgrade-to-plan';
import isPlanAvailableForPurchase from 'calypso/state/sites/plans/selectors/is-plan-available-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlugs: PlanSlug[];
	siteId?: number | null;
	shouldIgnorePlanOwnership?: boolean;
}

type PlanAvailabilityForPurchase = {
	[ planSlug in PlanSlug ]?: boolean;
};

/**
 * Returns a dictionary of plan slugs and whether or not they are available for purchase.
 * Note that:
 * - If there is not current-plan or selected-site defined, then plan is marked as purchasable.
 * This would be the equivalent of an Onboarding/Signup context, where no other conditions currently apply.
 * - If a selected site exists, then we check if the plan is available for purchase on that site.
 * - If `shouldIgnorePlanOwnership` is true, then we do not check if the user is the owner of the current plan.
 */
const useCheckPlanAvailabilityForPurchase = ( {
	planSlugs,
	siteId,
	shouldIgnorePlanOwnership,
}: Props ): PlanAvailabilityForPurchase => {
	// In some cases, we may not have the selected site ID available, so we fallback to the siteId prop.
	// For example, when the user is redirected to the domain upsell page from the free signup flow.
	const selectedSiteId = useSelector( getSelectedSiteId ) || siteId;
	const currentPlan = Plans.useCurrentPlan( { siteId: selectedSiteId } );

	return useSelector(
		( state ) =>
			Object.fromEntries(
				planSlugs.map( ( planSlug ) => {
					// 1. No selected site or current plan: plan is in a context-free state and is available for purchase
					if ( ! selectedSiteId || ! currentPlan ) {
						return [ planSlug, true ];
					}

					// 2. If shouldIgnorePlanOwnership is true, return whether a plan upgrade is possible
					if ( shouldIgnorePlanOwnership ) {
						return [ planSlug, canUpgradeToPlan( state, selectedSiteId, planSlug ) ];
					}

					// 3. Otherwise, check if the plan is available for purchase on the selected site
					return [ planSlug, isPlanAvailableForPurchase( state, selectedSiteId, planSlug ) ];
				} )
			),
		shallowEqual
	);
};

export default useCheckPlanAvailabilityForPurchase;
