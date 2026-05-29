import { AkismetPlans } from '@automattic/api-core';

/**
 * Determines whether the specified product slug is for an Akismet Pro 500 plan.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any Akismeret Pro 500 plan, false otherwise
 */
export function isAkismetPro500Plan( productSlug: string ): boolean {
	return (
		[
			AkismetPlans.PRODUCT_AKISMET_PRO_500_MONTHLY,
			AkismetPlans.PRODUCT_AKISMET_PRO_500_YEARLY,
			AkismetPlans.PRODUCT_AKISMET_PRO_500_BI_YEARLY,
		] as readonly string[]
	 ).includes( productSlug );
}

/**
 * Determines whether the specified product slug is for an Akismet Business 5k plan.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any Akismet Business 5k plan, false otherwise
 */
export function isAkismetBusiness5kPlan( productSlug: string ): boolean {
	return (
		[
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_MONTHLY,
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_YEARLY,
			AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY,
		] as readonly string[]
	 ).includes( productSlug );
}
