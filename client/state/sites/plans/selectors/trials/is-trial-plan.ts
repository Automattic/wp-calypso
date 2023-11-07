import {
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';

/**
 * Checks if the plan is an ecommerce trial.
 *
 * @param {SitePlanData} plan - Plan object
 * @returns {boolean} returns true if the plan is an ecommerce trial
 */
export function isECommerceTrialPlan( plan: SitePlanData ): boolean {
	return plan.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
}

/**
 * Checks if the plan is a migration trial.
 *
 * @param {SitePlanData} plan - Plan object
 * @returns {boolean} returns true if the plan is an migration trial
 */
export function isMigrationTrialPlan( plan: SitePlanData ): boolean {
	return plan.productSlug === PLAN_MIGRATION_TRIAL_MONTHLY;
}

/**
 * Returns true if the site has a trial plan.
 *
 * @param {SitePlanData} plan - Plan object
 * @returns boolean returns true if it's a trial plan
 */
export default function isTrialPlan( plan: SitePlanData ): boolean {
	if ( ! plan ) {
		return false;
	}

	return isECommerceTrialPlan( plan ) || isMigrationTrialPlan( plan );
}
