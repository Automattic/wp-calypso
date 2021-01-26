/**
 * External dependencies
 */

// plans constants
export const PLAN_FREE = 'free_plan';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';

export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';

export const TIMELESS_PLAN_FREE = 'Free';
export const TIMELESS_PLAN_PERSONAL = 'Personal';
export const TIMELESS_PLAN_PREMIUM = 'Premium';
export const TIMELESS_PLAN_BUSINESS = 'Business';
export const TIMELESS_PLAN_ECOMMERCE = 'Ecommerce';

export const STORE_KEY = 'automattic/onboard/plans';

export const DEFAULT_PAID_PLAN = TIMELESS_PLAN_PREMIUM;
export const annualSlugs = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ] as const;

export const monthlySlugs = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
] as const;

export const plansOrder = [
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PERSONAL,
	TIMELESS_PLAN_PREMIUM,
	TIMELESS_PLAN_BUSINESS,
	TIMELESS_PLAN_ECOMMERCE,
] as const;

export const plansPaths = [ 'free', 'personal', 'premium', 'business', 'ecommerce' ] as const;

export const plansProductSlugs = [ PLAN_FREE, ...annualSlugs, ...monthlySlugs ] as const;

export const FEATURE_IDS_THAT_REQUIRE_ANNUALLY_BILLED_PLAN = [
	'custom-domain',
	'support-live',
	// 'priority-support',
];
