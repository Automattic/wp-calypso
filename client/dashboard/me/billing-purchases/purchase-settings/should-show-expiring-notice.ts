import { SubscriptionBillPeriod } from '@automattic/api-core';
import { isEligibleForPlanExpiryNotice } from '../../../components/plan-expiry-notice/get-plan-expiry-notice';
import {
	isIncludedWithPlan,
	isExpiring,
	isCloseToExpiration,
	isAkismetFreeProduct,
} from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

export function shouldShowExpiringNotice(
	purchase: Purchase,
	purchaseAttachedTo: Purchase | undefined
) {
	// For purchases included with a plan (for example, a domain mapping
	// bundled with the plan), the plan purchase is used on this page when
	// there are other upcoming renewals to display, so for consistency it
	// should also be used here (where there are no upcoming renewals to
	// display).
	const usePlanInsteadOfIncludedPurchase = Boolean(
		isIncludedWithPlan( purchase ) && purchaseAttachedTo?.is_plan
	);
	const currentPurchase: Purchase =
		usePlanInsteadOfIncludedPurchase && purchaseAttachedTo ? purchaseAttachedTo : purchase;
	if (
		! isExpiring( currentPurchase ) ||
		currentPurchase?.is_trial_plan ||
		isAkismetFreeProduct( currentPurchase )
	) {
		return false;
	}

	if ( purchase.is_hundred_year_domain ) {
		return false;
	}

	// PlanExpiryNotice owns this scenario for the plans it covers. When it
	// stays quiet for one of them that is a decision, not a gap, so we must
	// not fall back on this weaker message.
	if ( isEligibleForPlanExpiryNotice( currentPurchase ) ) {
		return false;
	}

	if (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD &&
		! isCloseToExpiration( purchase )
	) {
		return false;
	}

	if ( usePlanInsteadOfIncludedPurchase && ! purchase.site_slug ) {
		return false;
	}
	return true;
}
