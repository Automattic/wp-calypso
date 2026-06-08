import {
	PLAN_FREE,
	PLAN_JETPACK_FREE,
	PLAN_P2_PLUS,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isFreePlan,
} from '@automattic/calypso-products';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getCurrentPlan, getSitePlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import type { AppState } from 'calypso/types';

/**
 * Whether a given site can be upgraded to a specific plan.
 * @param  state      Global state tree
 * @param  siteId     The site we're interested in upgrading
 * @param  planKey    The plan we want to upgrade to
 * @returns           True if the site can be upgraded
 */
export default function canUpgradeToPlan(
	state: AppState,
	siteId: number,
	planKey: string
): boolean {
	// Which "free plan" should we use to test
	const freePlan =
		isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId )
			? PLAN_JETPACK_FREE
			: PLAN_FREE;
	const plan = getCurrentPlan( state, siteId ) as SitePlanData | null;
	const purchase = plan?.id ? getByPurchaseId( state, plan.id ) : null;

	// An expired (but still active) plan is treated as the free plan for upgrade
	// purposes. `expired` comes from the endpoint's `is_expired` field.
	const currentPlanSlug = plan?.expired ? freePlan : plan?.productSlug ?? freePlan;

	// Exception for upgrading Atomic v1 sites to eCommerce
	const isAtomicV1 =
		isSiteAutomatedTransfer( state, siteId ) && ! isSiteWpcomAtomic( state, siteId );
	if ( ( isWpComEcommercePlan( planKey ) && isAtomicV1 ) || purchase?.isLocked ) {
		return false;
	}

	// Exception for AutomatedTransfer on a free plan (expired subscription) to wpcom business plan
	if (
		( isWpComBusinessPlan( planKey ) || isWpComEcommercePlan( planKey ) ) &&
		isFreePlan( currentPlanSlug ) &&
		isSiteAutomatedTransfer( state, siteId )
	) {
		return true;
	}

	// 2024-04-02 Disable upgrade to P2+
	if ( PLAN_P2_PLUS === planKey ) {
		return false;
	}

	const targetPlan = getSitePlan( state, siteId, planKey ) as SitePlanData | undefined;
	return targetPlan?.availableForUpgrade ?? false;
}
