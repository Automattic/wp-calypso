import { PLAN_ENTERPRISE_GRID_WPCOM } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { isCurrentPlanPaid, isJetpackSite } from 'calypso/state/sites/selectors';
import { usePlanUpgradeCredits } from './use-plan-upgrade-credits';

export function usePlanUpgradeCreditsDisplay(
	siteId: number,
	visiblePlanNames: string[] = []
): {
	creditsValue: number;
	isPlanUpgradeCreditEligible: boolean;
} {
	const isSiteOnPaidPlan = !! useSelector( ( state ) => isCurrentPlanPaid( state, siteId ) );
	const currentSitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const creditsValue = usePlanUpgradeCredits( siteId, visiblePlanNames );
	const isJetPackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
	);

	const isHigherPlanAvailable = function () {
		const visiblePlansWithoutEnterprise = visiblePlanNames.filter(
			( planName ) => planName !== PLAN_ENTERPRISE_GRID_WPCOM
		);
		const highestPlanName = visiblePlansWithoutEnterprise.pop();
		return highestPlanName !== currentSitePlanSlug;
	};

	const isUpgradeEligibleSite = isSiteOnPaidPlan && ! isJetPackNotAtomic && isHigherPlanAvailable();

	return {
		creditsValue,
		isPlanUpgradeCreditEligible: isUpgradeEligibleSite && creditsValue > 0,
	};
}
