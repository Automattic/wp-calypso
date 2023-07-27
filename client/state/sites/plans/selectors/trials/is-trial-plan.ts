import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { isECommerceTrialPlan } from './get-ecommerce-trial-expiration';
import { isMigrationTrialPlan } from './get-migration-trial-expiration';

/**
 * Checks if the plan is a trial.
 *
 * @param {SitePlanData | string} plan - Plan object
 * @returns {boolean} returns true if the plan is an migration trial
 */
export default function isTrialPlan( plan: SitePlanData | string ): boolean {
	return isMigrationTrialPlan( plan ) || isECommerceTrialPlan( plan );
}
