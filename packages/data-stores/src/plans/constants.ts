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
] as const;

export const DEFAULT_PAID_PLAN = TIMELESS_PLAN_PREMIUM;

// plan products constants
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_BUSINESS_3_YEARS = 'business-bundle-3y';

export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PREMIUM_3_YEARS = 'value_bundle-3y';

export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_PERSONAL_3_YEARS = 'personal-bundle-3y';

export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';
export const PLAN_ECOMMERCE_2_YEARS = 'ecommerce-bundle-2y';
export const PLAN_ECOMMERCE_3_YEARS = 'ecommerce-bundle-3y';
export const PLAN_ECOMMERCE_TRIAL_MONTHLY = 'ecommerce-trial-bundle-monthly';

export const PLAN_FREE = 'free_plan';
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';

export const monthlySlugs = [
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
] as const;

export const annualSlugs = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ] as const;

export const biennialSLugs = [
	PLAN_PERSONAL_2_YEARS,
	PLAN_PREMIUM_2_YEARS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_ECOMMERCE_2_YEARS,
] as const;

export const triennialSlugs = [
	PLAN_PERSONAL_3_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
] as const;

export const plansProductSlugs = [
	PLAN_FREE,
	...monthlySlugs,
	...annualSlugs,
	...biennialSLugs,
	...triennialSlugs,
] as const;

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

// Non plan-specific constants
export const TERM_MONTHLY = 'TERM_MONTHLY';
export const TERM_ANNUALLY = 'TERM_ANNUALLY';
export const TERM_BIENNIALLY = 'TERM_BIENNIALLY';
export const TERM_TRIENNIALLY = 'TERM_TRIENNIALLY';

export const TERMS_LIST = [
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
] as const;
