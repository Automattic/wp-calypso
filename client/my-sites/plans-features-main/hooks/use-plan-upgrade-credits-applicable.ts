import { PlanSlug, PLAN_ENTERPRISE_GRID_WPCOM } from '@automattic/calypso-products';
import { useMaxPlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-max-plan-upgrade-credits';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * This hook determines if the plan upgrade credit should be visible in the current plans display context
 * and returns the credits value if applicable
 * @param siteId Considered site id
 * @param visiblePlans Plans that are visible to the user
 * @returns number | null if the credit should not be displayed to the user
 */
export function usePlanUpgradeCreditsApplicable(
	siteId?: number | null,
	visiblePlans: PlanSlug[] = []
): number | null {
	const isSiteOnPaidPlan = !! useSelector(
		( state ) => siteId && isCurrentPlanPaid( state, siteId )
	);
	const currentSitePlanSlug = useSelector( ( state ) =>
		siteId ? getSitePlanSlug( state, siteId ) : undefined
	);
	const creditsValue = useMaxPlanUpgradeCredits( { siteId, plans: visiblePlans } );
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);
	const isHigherPlanAvailable = function () {
		const visiblePlansWithoutEnterprise = visiblePlans.filter(
			( planName ) => planName !== PLAN_ENTERPRISE_GRID_WPCOM
		);
		const highestPlanName = visiblePlansWithoutEnterprise.pop();
		return highestPlanName !== currentSitePlanSlug;
	};

	// !isJetpackNotAtomic means --> A non atomic jetpack site is not upgradeable (!isJetpackSite || isAtomicSite)
	const isUpgradeEligibleSite = isSiteOnPaidPlan && ! isJetpackNotAtomic && isHigherPlanAvailable();

	return isUpgradeEligibleSite ? creditsValue : null;
}
