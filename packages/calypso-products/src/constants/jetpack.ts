import { PRODUCT_WPCOM_SEARCH, PRODUCT_WPCOM_SEARCH_MONTHLY } from './wpcom';

export const GROUP_JETPACK = 'GROUP_JETPACK';

// Products
export const PRODUCT_JETPACK_AI_MONTHLY = 'jetpack_ai_monthly';
export const PRODUCT_JETPACK_BOOST = 'jetpack_boost_yearly';
export const PRODUCT_JETPACK_BOOST_MONTHLY = 'jetpack_boost_monthly';
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_T0_YEARLY = 'jetpack_backup_t0_yearly';
export const PRODUCT_JETPACK_BACKUP_T0_MONTHLY = 'jetpack_backup_t0_monthly';
export const PRODUCT_JETPACK_BACKUP_T1_YEARLY = 'jetpack_backup_t1_yearly';
export const PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY = 'jetpack_backup_t1_bi_yearly';
export const PRODUCT_JETPACK_BACKUP_T1_MONTHLY = 'jetpack_backup_t1_monthly';
export const PRODUCT_JETPACK_BACKUP_T2_YEARLY = 'jetpack_backup_t2_yearly';
export const PRODUCT_JETPACK_BACKUP_T2_MONTHLY = 'jetpack_backup_t2_monthly';
export const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
export const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';
export const PRODUCT_JETPACK_SCAN_REALTIME = 'jetpack_scan_realtime';
export const PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY = 'jetpack_scan_realtime_monthly';
export const PRODUCT_JETPACK_ANTI_SPAM = 'jetpack_anti_spam';
export const PRODUCT_JETPACK_ANTI_SPAM_MONTHLY = 'jetpack_anti_spam_monthly';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_FREE = 'jetpack_search_free';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_JETPACK_STATS_MONTHLY = 'jetpack_stats_monthly';
export const PRODUCT_JETPACK_STATS_PWYW_YEARLY = 'jetpack_stats_pwyw_yearly';
export const PRODUCT_JETPACK_STATS_FREE_YEARLY = 'jetpack_stats_free_yearly';
export const PRODUCT_JETPACK_CRM = 'jetpack_crm';
export const PRODUCT_JETPACK_CRM_MONTHLY = 'jetpack_crm_monthly';
export const PRODUCT_JETPACK_CRM_FREE = 'jetpack_crm_free';
export const PRODUCT_JETPACK_CRM_FREE_MONTHLY = 'jetpack_crm_free_monthly';
export const PRODUCT_JETPACK_VIDEOPRESS = 'jetpack_videopress';
export const PRODUCT_JETPACK_VIDEOPRESS_MONTHLY = 'jetpack_videopress_monthly';
export const PRODUCT_JETPACK_SOCIAL_BASIC = 'jetpack_social_basic_yearly';
export const PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY = 'jetpack_social_basic_monthly';
export const PRODUCT_JETPACK_SOCIAL_ADVANCED = 'jetpack_social_advanced_yearly';
export const PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY = 'jetpack_social_advanced_monthly';

//add-on products
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY =
	'jetpack_backup_addon_storage_10gb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY =
	'jetpack_backup_addon_storage_100gb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY =
	'jetpack_backup_addon_storage_1tb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY =
	'jetpack_backup_addon_storage_3tb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY =
	'jetpack_backup_addon_storage_5tb_monthly';

export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY =
	'jetpack_backup_addon_storage_10gb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY =
	'jetpack_backup_addon_storage_100gb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY =
	'jetpack_backup_addon_storage_1tb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY =
	'jetpack_backup_addon_storage_3tb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY =
	'jetpack_backup_addon_storage_5tb_yearly';

// Legacy Products
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';

// Backup
export const JETPACK_BACKUP_PRODUCTS_YEARLY = <const>[
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = <const>[
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = <const>[
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];
export const JETPACK_BACKUP_ADDON_MONTHLY = <const>[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
];
export const JETPACK_BACKUP_ADDON_YEARLY = <const>[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
];
export const JETPACK_BACKUP_ADDON_PRODUCTS = <const>[
	...JETPACK_BACKUP_ADDON_MONTHLY,
	...JETPACK_BACKUP_ADDON_YEARLY,
];
export const JETPACK_BACKUP_T0_PRODUCTS = <const>[
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
];
export const JETPACK_BACKUP_T1_PRODUCTS = <const>[
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
];
export const JETPACK_BACKUP_T2_PRODUCTS = <const>[
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
];
// Boost
export const JETPACK_BOOST_PRODUCTS = <const>[
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
];

// Scan
export const JETPACK_SCAN_PRODUCTS = <const>[
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
];

// Social Basic
export const JETPACK_SOCIAL_BASIC_PRODUCTS = <const>[
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
];

// Social Advanced
export const JETPACK_SOCIAL_ADVANCED_PRODUCTS = <const>[
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
];

// Social
export const JETPACK_SOCIAL_PRODUCTS = <const>[
	...JETPACK_SOCIAL_BASIC_PRODUCTS,
	...JETPACK_SOCIAL_ADVANCED_PRODUCTS,
];

// Anti-spam
export const JETPACK_ANTI_SPAM_PRODUCTS = <const>[
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
];

// Search
export const JETPACK_SEARCH_PRODUCTS = <const>[
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

// Stats
export const JETPACK_STATS_PRODUCTS = <const>[
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE_YEARLY,
];

// CRM
export const JETPACK_CRM_PRODUCTS = <const>[ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];
export const JETPACK_CRM_FREE_PRODUCTS = <const>[
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
];

// VideoPress
export const JETPACK_VIDEOPRESS_PRODUCTS = <const>[
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
];

export const JETPACK_AI_PRODUCTS = <const>[ PRODUCT_JETPACK_AI_MONTHLY ];

export const JETPACK_MONTHLY_ONLY_PRODUCTS = <const>[ PRODUCT_JETPACK_AI_MONTHLY ];

export const JETPACK_PRODUCTS_LIST = <const>[
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_BOOST_PRODUCTS,
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
	...JETPACK_STATS_PRODUCTS,
	...JETPACK_VIDEOPRESS_PRODUCTS,
	...JETPACK_SOCIAL_PRODUCTS,
	...JETPACK_BACKUP_ADDON_PRODUCTS,
	...JETPACK_AI_PRODUCTS,
];

export const JETPACK_PRODUCTS_BY_TERM = <const>[
	{
		yearly: PRODUCT_JETPACK_BACKUP_DAILY,
		monthly: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_BACKUP_REALTIME,
		monthly: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SEARCH,
		monthly: PRODUCT_JETPACK_SEARCH_MONTHLY,
	},
	{
		yearly: PRODUCT_WPCOM_SEARCH,
		monthly: PRODUCT_WPCOM_SEARCH_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SCAN,
		monthly: PRODUCT_JETPACK_SCAN_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_ANTI_SPAM,
		monthly: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_CRM,
		monthly: PRODUCT_JETPACK_CRM_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_CRM_FREE,
		monthly: PRODUCT_JETPACK_CRM_FREE_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		monthly: PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_BACKUP_T2_YEARLY,
		monthly: PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_VIDEOPRESS,
		monthly: PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_BOOST,
		monthly: PRODUCT_JETPACK_BOOST_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SOCIAL_BASIC,
		monthly: PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	},
	{
		yearly: PRODUCT_JETPACK_SOCIAL_ADVANCED,
		monthly: PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
	},
	{
		yearly: null,
		monthly: PRODUCT_JETPACK_AI_MONTHLY,
	},
];
export const JETPACK_PRODUCT_PRICE_MATRIX = <const>{
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: {
		relatedProduct: PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_BOOST ]: {
		relatedProduct: PRODUCT_JETPACK_BOOST_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: {
		relatedProduct: PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: {
		relatedProduct: PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SEARCH ]: {
		relatedProduct: PRODUCT_JETPACK_SEARCH_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_SCAN ]: {
		relatedProduct: PRODUCT_JETPACK_SCAN_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_ANTI_SPAM ]: {
		relatedProduct: PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
		ratio: 12,
	},
	[ PRODUCT_JETPACK_VIDEOPRESS ]: {
		relatedProduct: PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
		ratio: 12,
	},
};
// Key/value: Superseding product/Products superseded (yearly terms)
export const JETPACK_PRODUCT_UPGRADE_MAP: Record< string, string[] > = {
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: [ PRODUCT_JETPACK_BACKUP_T1_YEARLY ],
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: [ PRODUCT_JETPACK_BACKUP_DAILY ],
};

// Plans
export const PLAN_JETPACK_FREE = 'jetpack_free';
export const PLAN_JETPACK_PERSONAL = 'jetpack_personal';
export const PLAN_JETPACK_PERSONAL_MONTHLY = 'jetpack_personal_monthly';
export const PLAN_JETPACK_PREMIUM = 'jetpack_premium';
export const PLAN_JETPACK_PREMIUM_MONTHLY = 'jetpack_premium_monthly';
export const PLAN_JETPACK_BUSINESS = 'jetpack_business';
export const PLAN_JETPACK_BUSINESS_MONTHLY = 'jetpack_business_monthly';
export const PLAN_JETPACK_SECURITY_T1_YEARLY = 'jetpack_security_t1_yearly';
export const PLAN_JETPACK_SECURITY_T1_MONTHLY = 'jetpack_security_t1_monthly';
export const PLAN_JETPACK_SECURITY_T1_BI_YEARLY = 'jetpack_security_t1_bi_yearly';
export const PLAN_JETPACK_SECURITY_T2_YEARLY = 'jetpack_security_t2_yearly';
export const PLAN_JETPACK_SECURITY_T2_MONTHLY = 'jetpack_security_t2_monthly';
export const PLAN_JETPACK_COMPLETE = 'jetpack_complete';
export const PLAN_JETPACK_COMPLETE_MONTHLY = 'jetpack_complete_monthly';
export const PLAN_JETPACK_STARTER_YEARLY = 'jetpack_starter_yearly';
export const PLAN_JETPACK_STARTER_MONTHLY = 'jetpack_starter_monthly';
export const PLAN_JETPACK_GOLDEN_TOKEN = 'jetpack_golden_token_lifetime';

// Legacy Security Plans
export const PLAN_JETPACK_SECURITY_DAILY = 'jetpack_security_daily';
export const PLAN_JETPACK_SECURITY_DAILY_MONTHLY = 'jetpack_security_daily_monthly';
export const PLAN_JETPACK_SECURITY_REALTIME = 'jetpack_security_realtime';
export const PLAN_JETPACK_SECURITY_REALTIME_MONTHLY = 'jetpack_security_realtime_monthly';

// Legacy (before offer reset)
export const JETPACK_LEGACY_PLANS = <const>[
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
];
export const JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION = '8.9.1'; // Jetpack versions prior to this one are not fully compatible with new plans

// Security
export const JETPACK_SECURITY_PLANS = <const>[
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
];
export const JETPACK_SECURITY_T1_PLANS = <const>[
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
];

export const JETPACK_SECURITY_T2_PLANS = <const>[
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
];

// Complete
export const JETPACK_COMPLETE_PLANS = <const>[
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];

// Starter
export const JETPACK_STARTER_PLANS = <const>[
	PLAN_JETPACK_STARTER_YEARLY,
	PLAN_JETPACK_STARTER_MONTHLY,
];

export const JETPACK_MONTHLY_PLANS = <const>[
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];
export const JETPACK_RESET_PLANS = <const>[
	...JETPACK_STARTER_PLANS,
	...JETPACK_SECURITY_PLANS,
	...JETPACK_COMPLETE_PLANS,
	PLAN_JETPACK_GOLDEN_TOKEN,
];
export const JETPACK_RESET_PLANS_BY_TERM = <const>[
	{
		yearly: PLAN_JETPACK_COMPLETE,
		monthly: PLAN_JETPACK_COMPLETE_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_SECURITY_DAILY,
		monthly: PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_SECURITY_REALTIME,
		monthly: PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_SECURITY_T1_YEARLY,
		monthly: PLAN_JETPACK_SECURITY_T1_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_SECURITY_T2_YEARLY,
		monthly: PLAN_JETPACK_SECURITY_T2_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_STARTER_YEARLY,
		monthly: PLAN_JETPACK_STARTER_MONTHLY,
	},
];
export const JETPACK_PLANS = <const>[
	PLAN_JETPACK_FREE,
	...JETPACK_LEGACY_PLANS,
	...JETPACK_RESET_PLANS,
];
export const JETPACK_PLANS_BY_TERM = <const>[
	{
		yearly: PLAN_JETPACK_BUSINESS,
		monthly: PLAN_JETPACK_BUSINESS_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_PERSONAL,
		monthly: PLAN_JETPACK_PERSONAL_MONTHLY,
	},
	{
		yearly: PLAN_JETPACK_PREMIUM,
		monthly: PLAN_JETPACK_PREMIUM_MONTHLY,
	},
	...JETPACK_RESET_PLANS_BY_TERM,
];
export const BEST_VALUE_PLANS = <const>[ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ];
// Key/value: Superseding plan/Plans superseded (yearly terms)
export const JETPACK_PLAN_UPGRADE_MAP: Record< string, string[] > = {
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: [
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_STARTER_YEARLY,
	],
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: [ PLAN_JETPACK_STARTER_YEARLY ],
	[ PLAN_JETPACK_SECURITY_REALTIME ]: [ PLAN_JETPACK_SECURITY_DAILY ],
	[ PLAN_JETPACK_COMPLETE ]: [
		PLAN_JETPACK_SECURITY_REALTIME,
		PLAN_JETPACK_SECURITY_DAILY,
		PLAN_JETPACK_SECURITY_T2_YEARLY,
		PLAN_JETPACK_SECURITY_T1_YEARLY,
		PLAN_JETPACK_STARTER_YEARLY,
	],
};

// Categories
export const JETPACK_SECURITY_CATEGORY = 'jetpack_security_category';
export const JETPACK_PERFORMANCE_CATEGORY = 'jetpack_performance_category';
export const JETPACK_GROWTH_CATEGORY = 'jetpack_growth_category';
export const JETPACK_PRODUCT_CATEGORIES = <const>[
	JETPACK_SECURITY_CATEGORY,
	JETPACK_PERFORMANCE_CATEGORY,
	JETPACK_GROWTH_CATEGORY,
];

// URL
export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';
export const JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/search/';
export const JETPACK_STATS_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/stats/';
export const JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/scan/';
export const JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/anti-spam/';
export const JETPACK_BOOST_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/boost/';
export const JETPACK_SOCIAL_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/social/';
export const JETPACK_VIDEOPRESS_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/videopress/';
export const JETPACK_CRM_PRODUCT_LANDING_PAGE_URL = 'https://jetpackcrm.com/';
// If JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN is true, checkout will redirect to the site's wp-admin,
// otherwise it will redirect to the JETPACK_REDIRECT_URL. Checkout references these constants in:
// client/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url.ts
export const JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN = true;
export const JETPACK_REDIRECT_URL =
	'https://jetpack.com/redirect/?source=jetpack-checkout-thankyou';

// Key/value maps related products to a given one
export const JETPACK_RELATED_PRODUCTS_MAP: Record< string, string[] > = {
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: [
		PRODUCT_JETPACK_SOCIAL_ADVANCED,
		PRODUCT_JETPACK_SOCIAL_BASIC,
	],
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: [
		PRODUCT_JETPACK_SOCIAL_ADVANCED,
		PRODUCT_JETPACK_SOCIAL_BASIC,
	],
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: [
		PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
		PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	],
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: [
		PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
		PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
	],
};

// Tags, 'Recommended for'
export const JETPACK_TAG_FOR_WOOCOMMERCE_STORES = 'jetpack_tag_for_woocommerce_stores';
export const JETPACK_TAG_FOR_NEWS_ORGANISATIONS = 'jetpack_tag_for_news_organisations';
export const JETPACK_TAG_FOR_MEMBERSHIP_SITES = 'jetpack_tag_for_membership_sites';
export const JETPACK_TAG_FOR_ONLINE_FORUMS = 'jetpack_tag_for_online_forums';
export const JETPACK_TAG_FOR_BLOGS = 'jetpack_tag_for_blogs';
export const JETPACK_TAG_FOR_VIDEOGRAPHERS = 'jetpack_tag_for_videographers';
export const JETPACK_TAG_FOR_EDUCATORS = 'jetpack_tag_for_educators';
export const JETPACK_TAG_FOR_BLOGGERS = 'jetpack_tag_for_bloggers';
export const JETPACK_TAG_FOR_ALL_SITES = 'jetpack_tag_for_all_sites';
export const JETPACK_TAG_FOR_SMALL_SITES = 'jetpack_tag_for_small_sites';

// Maps products to 'Recommended for' tags
export const JETPACK_PRODUCT_RECCOMENDATION_MAP: Record< string, string[] > = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_VIDEOPRESS ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_VIDEOGRAPHERS,
		JETPACK_TAG_FOR_EDUCATORS,
		JETPACK_TAG_FOR_BLOGS,
	],
	[ PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_VIDEOGRAPHERS,
		JETPACK_TAG_FOR_EDUCATORS,
		JETPACK_TAG_FOR_BLOGS,
	],
	[ PRODUCT_JETPACK_ANTI_SPAM ]: [
		JETPACK_TAG_FOR_BLOGS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_ANTI_SPAM_MONTHLY ]: [
		JETPACK_TAG_FOR_BLOGS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_SCAN ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_SCAN_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_SCAN_REALTIME ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_SEARCH ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_SEARCH_MONTHLY ]: [
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
	],
	[ PRODUCT_JETPACK_BOOST ]: [ JETPACK_TAG_FOR_ALL_SITES ],
	[ PRODUCT_JETPACK_BOOST_MONTHLY ]: [ JETPACK_TAG_FOR_ALL_SITES ],
	[ PRODUCT_JETPACK_SOCIAL_BASIC ]: [
		JETPACK_TAG_FOR_BLOGGERS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY ]: [
		JETPACK_TAG_FOR_BLOGGERS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED ]: [
		JETPACK_TAG_FOR_BLOGGERS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY ]: [
		JETPACK_TAG_FOR_BLOGGERS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
	[ PRODUCT_JETPACK_AI_MONTHLY ]: [
		JETPACK_TAG_FOR_BLOGGERS,
		JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
		JETPACK_TAG_FOR_MEMBERSHIP_SITES,
		JETPACK_TAG_FOR_ONLINE_FORUMS,
		JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	],
};
