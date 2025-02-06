export const STORE_KEY = 'automattic/onboard/plans';

export const FREE_PLAN_PRODUCT_ID = 1;

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
	// Keeping the old slugs for backwards compatibility.
	'starter',
	'explorer',
	'creator',
	'entrepreneur',
] as const;

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
export const PLAN_ECOMMERCE_TRIAL_MONTHLY = 'ecommerce-trial-bundle-monthly';
export const PLAN_MIGRATION_TRIAL_MONTHLY = 'wp_bundle_migration_trial_monthly';

export const annualSlugs = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ] as const;

export const monthlySlugs = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
] as const;

export const plansProductSlugs = [ PLAN_FREE, ...annualSlugs, ...monthlySlugs ] as const;

export const FEATURE_IDS_THAT_REQUIRE_ANNUALLY_BILLED_PLAN = [
	'custom-domain',
	'support-live',
	'priority-support',
];

export const PLAN_MONTHLY_PERIOD = 31;
export const PLAN_ANNUAL_PERIOD = 365;
export const PLAN_BIENNIAL_PERIOD = 730;
export const PLAN_TRIENNIAL_PERIOD = 1095;

export const PERIOD_LIST = [
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
] as const;

export const COST_OVERRIDE_REASONS = {
	RECENT_PLAN_PRORATION: 'recent-plan-proration',
	RECENT_DOMAIN_PRORATION: 'recent-domain-proration',
};
