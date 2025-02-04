export const GROUP_WPCOM = 'GROUP_WPCOM';
export const GROUP_P2 = 'GROUP_P2';

/**
 * WPCOM Search Products
 */
export const PRODUCT_WPCOM_SEARCH = 'wpcom_search';
export const PRODUCT_WPCOM_SEARCH_MONTHLY = 'wpcom_search_monthly';
export const WPCOM_SEARCH_PRODUCTS = < const >[
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

/**
 * WPCOM Space Upgrade Products
 * - Special products that do not yet map to the exported `PRODUCTS_LIST` in @automattic/calypso-products
 */
export const PRODUCT_1GB_SPACE_UPGRADE = '1gb_space_upgrade';
export const PRODUCT_5GB_SPACE_UPGRADE = '5gb_space_upgrade';
export const PRODUCT_10GB_SPACE_UPGRADE = '10gb_space_upgrade';
export const PRODUCT_50GB_SPACE_UPGRADE = '50gb_space_upgrade';
export const PRODUCT_100GB_SPACE_UPGRADE = '100gb_space_upgrade';
export const WPCOM_SPACE_UPGRADE_PRODUCTS = < const >[
	PRODUCT_1GB_SPACE_UPGRADE,
	PRODUCT_5GB_SPACE_UPGRADE,
	PRODUCT_10GB_SPACE_UPGRADE,
	PRODUCT_50GB_SPACE_UPGRADE,
	PRODUCT_100GB_SPACE_UPGRADE,
];

/**
 * WPCOM Other Products
 * - Special products that do not yet map to the exported `PRODUCTS_LIST` in @automattic/calypso-products
 */
export const PRODUCT_NO_ADS = 'no-adverts/no-adverts.php';
export const PRODUCT_WPCOM_UNLIMITED_THEMES = 'unlimited_themes';
export const PRODUCT_1GB_SPACE = 'wordpress_com_1gb_space_addon_yearly';
export const PRODUCT_WPCOM_CUSTOM_DESIGN = 'custom-design';
export const WPCOM_OTHER_PRODUCTS = < const >[
	PRODUCT_NO_ADS,
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_1GB_SPACE,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
];

/**
 * WPCOM Products / having definitions in `PRODUCTS_LIST` in @automattic/calypso-products
 */
export const WPCOM_PRODUCTS = < const >[ ...WPCOM_SEARCH_PRODUCTS ];

/**
 * Plans
 */
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_BUSINESS_3_YEARS = 'business-bundle-3y';
export const PLAN_100_YEARS = 'wp_com_hundred_year_bundle_centennially';
export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PREMIUM_3_YEARS = 'value_bundle-3y';
export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_PERSONAL_3_YEARS = 'personal-bundle-3y';
export const PLAN_BLOGGER = 'blogger-bundle';
export const PLAN_BLOGGER_2_YEARS = 'blogger-bundle-2y';
export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';
export const PLAN_ECOMMERCE_2_YEARS = 'ecommerce-bundle-2y';
export const PLAN_ECOMMERCE_3_YEARS = 'ecommerce-bundle-3y';
export const PLAN_ECOMMERCE_TRIAL_MONTHLY = 'ecommerce-trial-bundle-monthly';
export const PLAN_WOOEXPRESS_SMALL = 'wooexpress-small-bundle-yearly';
export const PLAN_WOOEXPRESS_SMALL_MONTHLY = 'wooexpress-small-bundle-monthly';
export const PLAN_WOOEXPRESS_MEDIUM = 'wooexpress-medium-bundle-yearly';
export const PLAN_WOOEXPRESS_MEDIUM_MONTHLY = 'wooexpress-medium-bundle-monthly';
export const PLAN_WOOEXPRESS_PLUS = 'wooexpress-plus'; // Not a real plan;
export const PLAN_FREE = 'free_plan';
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';
export const PLAN_CHARGEBACK = 'chargeback';
export const PLAN_VIP = 'vip';
export const PLAN_P2_PLUS = 'wp_p2_plus_monthly';
export const PLAN_P2_FREE = 'p2_free_plan'; // Not a real plan; it's a renamed WP.com Free for the P2 project.
export const PLAN_WPCOM_FLEXIBLE = 'wpcom-flexible'; // Not a real plan; it's a renamed WP.com Free for the plans overhaul.
export const PLAN_WPCOM_PRO = 'pro-plan';
export const PLAN_WPCOM_PRO_MONTHLY = 'pro-plan-monthly';
export const PLAN_WPCOM_PRO_2_YEARS = 'pro-plan-2y';
export const PLAN_WPCOM_STARTER = 'starter-plan';
export const PLAN_ENTERPRISE_GRID_WPCOM = 'plan-enterprise-grid-wpcom'; // Not a real plan; we show the VIP section in the plans grid as part of pdgrnI-1Qp-p2.
export const PLAN_MIGRATION_TRIAL_MONTHLY = 'wp_bundle_migration_trial_monthly';
export const PLAN_HOSTING_TRIAL_MONTHLY = 'wp_bundle_hosting_trial_monthly';

export const WPCOM_PLANS = < const >[
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_3_YEARS,
	PLAN_100_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_3_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_FREE,
	PLAN_HOST_BUNDLE,
	PLAN_WPCOM_ENTERPRISE,
	PLAN_CHARGEBACK,
	PLAN_VIP,
	PLAN_P2_PLUS,
	PLAN_P2_FREE,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_PRO_MONTHLY,
	PLAN_WPCOM_PRO_2_YEARS,
	PLAN_WPCOM_STARTER,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
];

export const WPCOM_MONTHLY_PLANS = < const >[
	PLAN_BUSINESS_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PERSONAL_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
	PLAN_WPCOM_PRO_MONTHLY,
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_FREE,
];

export const WOO_EXPRESS_PLANS = < const >[
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_WOOEXPRESS_PLUS,
];

export const WPCOM_PREMIUM_PLANS = < const >[
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_3_YEARS,
];

export const WPCOM_DIFM_LITE = 'wp_difm_lite';

export const PLAN_BUSINESS_ONBOARDING_EXPIRE = '2021-07-31T00:00:00+00:00';
export const PLAN_BUSINESS_2Y_ONBOARDING_EXPIRE = '2022-07-31T00:00:00+00:00';
