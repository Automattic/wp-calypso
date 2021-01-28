/**
 * External dependencies
 */

export const STORE_KEY = 'automattic/onboard/plans';

// plans constants
export const TIMELESS_PLAN_FREE = 'free';
export const TIMELESS_PLAN_PERSONAL = 'personal';
export const TIMELESS_PLAN_PREMIUM = 'premium';
export const TIMELESS_PLAN_BUSINESS = 'business';
export const TIMELESS_PLAN_ECOMMERCE = 'ecommerce';

export const plansSlugs = [
	TIMELESS_PLAN_FREE,
	TIMELESS_PLAN_PERSONAL,
	TIMELESS_PLAN_PREMIUM,
	TIMELESS_PLAN_BUSINESS,
	TIMELESS_PLAN_ECOMMERCE,
] as const;

// order of the plans used to determine recommended plan based on features
export const plansOrder = plansSlugs;

export const DEFAULT_PAID_PLAN = TIMELESS_PLAN_PREMIUM;

// plan products constants
export const PLAN_FREE = 'free_plan';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';

export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';

export const annualSlugs = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ] as const;

export const monthlySlugs = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
] as const;

export const plansProductSlugs = [ PLAN_FREE, ...annualSlugs, ...monthlySlugs ] as const;

export const FEATURE_IDS_THAT_REQUIRE_ANNUALLY_BILLED_PLAN = [
	'custom-domain',
	'support-live',
	'priority-support',
];
