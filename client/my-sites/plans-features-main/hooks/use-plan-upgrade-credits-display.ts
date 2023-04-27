import { PlanSlug, PLAN_ENTERPRISE_GRID_WPCOM } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { usePlanUpgradeCredits } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';

export function usePlanUpgradeCreditsDisplay(
	siteId: number,
	visiblePlanNames: PlanSlug[] = []
): {
	creditsValue: number;
	isPlanUpgradeCreditEligible: boolean;
} {
	const isSiteOnPaidPlan = !! useSelector( ( state ) => isCurrentPlanPaid( state, siteId ) );
	const currentSitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const creditsValue = usePlanUpgradeCredits( siteId, visiblePlanNames );
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);
	const isHigherPlanAvailable = function () {
		const visiblePlansWithoutEnterprise = visiblePlanNames.filter(
			( planName ) => planName !== PLAN_ENTERPRISE_GRID_WPCOM
		);
		const highestPlanName = visiblePlansWithoutEnterprise.pop();
		return highestPlanName !== currentSitePlanSlug;
	};

	// !isJetpackNotAtomic means --> A non atomic jetpack site is not upgradeable (!isJetpackSite || isAtomicSite)
	const isUpgradeEligibleSite = isSiteOnPaidPlan && ! isJetpackNotAtomic && isHigherPlanAvailable();

	return {
		creditsValue,
		isPlanUpgradeCreditEligible: isUpgradeEligibleSite && creditsValue > 0,
	};
}
