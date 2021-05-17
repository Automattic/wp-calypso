export const GROUP_WPCOM = 'GROUP_WPCOM';

// Products
export const PRODUCT_WPCOM_SEARCH = 'wpcom_search';
export const PRODUCT_WPCOM_SEARCH_MONTHLY = 'wpcom_search_monthly';

export const WPCOM_SEARCH_PRODUCTS = <const>[ PRODUCT_WPCOM_SEARCH, PRODUCT_WPCOM_SEARCH_MONTHLY ];

export const WPCOM_PRODUCTS = <const>[ ...WPCOM_SEARCH_PRODUCTS ];

// Plans
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_BLOGGER = 'blogger-bundle';
export const PLAN_BLOGGER_2_YEARS = 'blogger-bundle-2y';
export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';
export const PLAN_ECOMMERCE_2_YEARS = 'ecommerce-bundle-2y';
export const PLAN_FREE = 'free_plan';
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';
export const PLAN_CHARGEBACK = 'chargeback';
export const PLAN_VIP = 'vip';
export const PLAN_P2_PLUS = 'wp_p2_plus_monthly';
export const PLAN_P2_FREE = 'p2_free_plan'; // Not a real plan; it's a renamed WP.com Free for the P2 project.

export const WPCOM_PLANS = <const>[
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_FREE,
	PLAN_HOST_BUNDLE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_CHARGEBACK,
	PLAN_VIP,
	PLAN_P2_PLUS,
	PLAN_P2_FREE,
];

export const WPCOM_MONTHLY_PLANS = <const>[
	PLAN_BUSINESS_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PERSONAL_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
];

export const WPCOM_TRAFFIC_GUIDE = 'traffic-guide';

export const PLAN_BUSINESS_ONBOARDING_EXPIRE = '2021-07-31T00:00:00+00:00';
export const PLAN_BUSINESS_2Y_ONBOARDING_EXPIRE = '2022-07-31T00:00:00+00:00';
