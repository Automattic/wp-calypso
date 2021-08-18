import { PRODUCT_WPCOM_SEARCH, PRODUCT_WPCOM_SEARCH_MONTHLY } from './wpcom';

export const GROUP_JETPACK = 'GROUP_JETPACK';

// Products
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_T1_YEARLY = 'jetpack_backup_t1_yearly';
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
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_JETPACK_CRM = 'jetpack_crm';
export const PRODUCT_JETPACK_CRM_MONTHLY = 'jetpack_crm_monthly';
export const PRODUCT_JETPACK_CRM_FREE = 'jetpack_crm_free';
export const PRODUCT_JETPACK_CRM_FREE_MONTHLY = 'jetpack_crm_free_monthly';

// Legacy Products
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';

// Backup
export const JETPACK_BACKUP_PRODUCTS_YEARLY = <const>[
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = <const>[
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = <const>[
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

// Scan
export const JETPACK_SCAN_PRODUCTS = <const>[
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
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

// CRM
export const JETPACK_CRM_PRODUCTS = <const>[ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];
export const JETPACK_CRM_FREE_PRODUCTS = <const>[
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
];

export const JETPACK_PRODUCTS_LIST = <const>[
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
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
export const PLAN_JETPACK_SECURITY_T2_YEARLY = 'jetpack_security_t2_yearly';
export const PLAN_JETPACK_SECURITY_T2_MONTHLY = 'jetpack_security_t2_monthly';
export const PLAN_JETPACK_COMPLETE = 'jetpack_complete';
export const PLAN_JETPACK_COMPLETE_MONTHLY = 'jetpack_complete_monthly';

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
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
];

// Complete
export const JETPACK_COMPLETE_PLANS = <const>[
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
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
export const JETPACK_RESET_PLANS = <const>[ ...JETPACK_SECURITY_PLANS, ...JETPACK_COMPLETE_PLANS ];
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

// URL
export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';
export const JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/search/';
export const JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/scan/';
export const JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/anti-spam/';
// If JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN is true, checkout will redirect to the site's wp-admin,
// otherwise it will redirect to the JETPACK_REDIRECT_URL. Checkout references these constants in:
// client/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url.ts
export const JETPACK_REDIRECT_CHECKOUT_TO_WPADMIN = true;
export const JETPACK_REDIRECT_URL =
	'https://jetpack.com/redirect/?source=jetpack-checkout-thankyou';
