/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';

// Jetpack products constants
export const PRODUCT_JETPACK_BACKUP = 'jetpack_backup';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';
export const PRODUCT_WPCOM_SEARCH = 'wpcom_search';
export const PRODUCT_WPCOM_SEARCH_MONTHLY = 'wpcom_search_monthly';
export const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
export const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';
export const PRODUCT_JETPACK_SCAN_REALTIME = 'jetpack_scan_realtime';
export const PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY = 'jetpack_scan_realtime_monthly';
export const PRODUCT_JETPACK_ANTI_SPAM = 'jetpack_anti_spam';
export const PRODUCT_JETPACK_ANTI_SPAM_MONTHLY = 'jetpack_anti_spam_monthly';
export const PRODUCT_JETPACK_CRM = 'jetpack_crm';
export const PRODUCT_JETPACK_CRM_MONTHLY = 'jetpack_crm_monthly';
export const PRODUCT_JETPACK_CRM_FREE = 'jetpack_crm_free';
export const PRODUCT_JETPACK_CRM_FREE_MONTHLY = 'jetpack_crm_free_monthly';

export const JETPACK_PRODUCTS_BY_TERM = [
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
];

export const JETPACK_BACKUP_PRODUCTS_YEARLY = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
];
export const JETPACK_BACKUP_PRODUCTS_MONTHLY = [
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
];
export const JETPACK_BACKUP_PRODUCTS = [
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

export const JETPACK_SEARCH_PRODUCTS = [
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

export const JETPACK_SCAN_PRODUCTS = [
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
];

export const JETPACK_CRM_PRODUCTS = [ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];
export const JETPACK_CRM_FREE_PRODUCTS = [
	PRODUCT_JETPACK_CRM_FREE,
	PRODUCT_JETPACK_CRM_FREE_MONTHLY,
];

export const JETPACK_ANTI_SPAM_PRODUCTS = [
	PRODUCT_JETPACK_ANTI_SPAM,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
];

export const JETPACK_PRODUCTS_LIST = [
	...JETPACK_BACKUP_PRODUCTS,
	...( isEnabled( 'jetpack/scan-product' ) ? JETPACK_SCAN_PRODUCTS : [] ),
	...( isEnabled( 'jetpack/anti-spam-product' ) ? JETPACK_ANTI_SPAM_PRODUCTS : [] ),
	...JETPACK_SEARCH_PRODUCTS,
];

export const JETPACK_BACKUP_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/backup/';
export const JETPACK_SEARCH_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/search/';
export const JETPACK_SCAN_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/scan/';
export const JETPACK_ANTI_SPAM_PRODUCT_LANDING_PAGE_URL = 'https://jetpack.com/upgrade/anti-spam/';

export const JETPACK_PRODUCT_PRICE_MATRIX = {
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

// If JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN is true, checkout will redirect to the site's wp-admin,
// otherwise it will redirect to the JETPACK_REDIRECT_URL. Checkout references these constants in:
// client/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url.ts
export const JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN = true;
export const JETPACK_REDIRECT_URL =
	'https://jetpack.com/redirect/?source=jetpack-checkout-thankyou';
export const redirectCloudCheckoutToWpAdmin = () => !! JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN;

// jetpack features category
export const FEATURE_CATEGORY_SECURITY = Symbol();
export const FEATURE_CATEGORY_PERFORMANCE = Symbol();
export const FEATURE_CATEGORY_GROWTH = Symbol();
export const FEATURE_CATEGORY_DESIGN = Symbol();
export const FEATURE_CATEGORY_OTHER = Symbol();

// jetpack features constants
export const FEATURE_BLANK = 'blank-feature';
export const FEATURE_STANDARD_SECURITY_TOOLS = 'standard-security-tools';
export const FEATURE_SITE_STATS = 'site-stats';
export const FEATURE_TRAFFIC_TOOLS = 'traffic-tools';
export const FEATURE_MANAGE = 'jetpack-manage';
export const FEATURE_SPAM_AKISMET_PLUS = 'spam-akismet-plus';
export const FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY = 'offsite-backup-vaultpress-daily';
export const FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME = 'offsite-backup-vaultpress-realtime';
export const FEATURE_BACKUP_ARCHIVE_30 = 'backup-archive-30';
export const FEATURE_BACKUP_ARCHIVE_15 = 'backup-archive-15';
export const FEATURE_BACKUP_ARCHIVE_UNLIMITED = 'backup-archive-unlimited';
export const FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED = 'backup-storage-space-unlimited';
export const FEATURE_AUTOMATED_RESTORES = 'automated-restores';
export const FEATURE_EASY_SITE_MIGRATION = 'easy-site-migration';
export const FEATURE_MALWARE_SCANNING_DAILY = 'malware-scanning-daily';
export const FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND = 'malware-scanning-daily-and-on-demand';
export const FEATURE_ONE_CLICK_THREAT_RESOLUTION = 'one-click-threat-resolution';
export const FEATURE_AUTOMATIC_SECURITY_FIXES = 'automatic-security-fixes';
export const FEATURE_ACTIVITY_LOG = 'site-activity-log';
export const FEATURE_POLLS_PRO = 'polls-pro';
export const FEATURE_CORE_JETPACK = 'core-jetpack';
export const FEATURE_BASIC_SUPPORT_JETPACK = 'basic-support-jetpack';
export const FEATURE_SPEED_JETPACK = 'speed-jetpack';
export const FEATURE_SPEED_ADVANCED_JETPACK = 'speed-advanced-jetpack';
export const FEATURE_SPEED_UNLIMITED_JETPACK = 'speed-unlimited_jetpack';
export const FEATURE_BASIC_SECURITY_JETPACK = 'basic-security-jetpack';
export const FEATURE_SITE_BACKUPS_JETPACK = 'site-backups-jetpack';
export const FEATURE_SECURITY_SCANNING_JETPACK = 'security-scanning-jetpack';
export const FEATURE_REVENUE_GENERATION_JETPACK = 'revenue-generation-jetpack';
export const FEATURE_VIDEO_HOSTING_JETPACK = 'vidoe-hosting-jetpack';
export const FEATURE_SECURITY_ESSENTIALS_JETPACK = 'security-essentials-jetpack';
export const FEATURE_TRAFFIC_TOOLS_JETPACK = 'seo-tools-jetpack';
export const FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK = 'seo-tools-jetpack';
export const FEATURE_FREE_WORDPRESS_THEMES = 'free-wordpress-themes';
export const FEATURE_VIDEO_CDN_LIMITED = 'video-cdn-limited';
export const FEATURE_VIDEO_CDN_UNLIMITED = 'video-cdn-unlimited';
export const FEATURE_SEO_PREVIEW_TOOLS = 'seo-preview-tools';
export const FEATURE_CONCIERGE_SETUP = 'concierge-setup-jetpack';
export const FEATURE_MARKETING_AUTOMATION = 'marketing-automation';
export const FEATURE_SEARCH = 'search';
export const FEATURE_ACCEPT_PAYMENTS = 'accept-payments';
export const FEATURE_SHIPPING_CARRIERS = 'shipping-carriers';
export const FEATURE_UNLIMITED_PRODUCTS_SERVICES = 'unlimited-products-service';
export const FEATURE_ECOMMERCE_MARKETING = 'ecommerce-marketing';
export const FEATURE_PREMIUM_CUSTOMIZABE_THEMES = 'premium-customizable-themes';
export const FEATURE_ALL_BUSINESS_FEATURES = 'all-business-features';
export const FEATURE_JETPACK_BACKUP_DAILY = PRODUCT_JETPACK_BACKUP_DAILY;
export const FEATURE_JETPACK_BACKUP_DAILY_MONTHLY = PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY;
export const FEATURE_JETPACK_BACKUP_REALTIME = PRODUCT_JETPACK_BACKUP_REALTIME;
export const FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY = PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY;
export const FEATURE_JETPACK_SCAN_DAILY = PRODUCT_JETPACK_SCAN;
export const FEATURE_JETPACK_SCAN_DAILY_MONTHLY = PRODUCT_JETPACK_SCAN_MONTHLY;
export const FEATURE_JETPACK_ANTI_SPAM = PRODUCT_JETPACK_ANTI_SPAM;
export const FEATURE_JETPACK_ANTI_SPAM_MONTHLY = PRODUCT_JETPACK_ANTI_SPAM_MONTHLY;
export const FEATURE_JETPACK_SEARCH = PRODUCT_JETPACK_SEARCH;
export const FEATURE_JETPACK_SEARCH_MONTHLY = PRODUCT_JETPACK_SEARCH_MONTHLY;
export const FEATURE_JETPACK_CRM = PRODUCT_JETPACK_CRM;
export const FEATURE_JETPACK_CRM_MONTHLY = PRODUCT_JETPACK_CRM_MONTHLY;

// jetpack features constants (offer reset)
export const FEATURE_SECURITY_REALTIME_V2 = 'security-realtime-v2';
export const FEATURE_BACKUP_V2 = 'backup-v2';
export const FEATURE_BACKUP_DAILY_V2 = 'backup-daily-v2';
export const FEATURE_BACKUP_REALTIME_V2 = 'backup-realtime-v2';
export const FEATURE_PRODUCT_BACKUP_V2 = 'product-backup-v2';
export const FEATURE_PRODUCT_BACKUP_DAILY_V2 = 'product-backup-daily-v2';
export const FEATURE_PRODUCT_BACKUP_REALTIME_V2 = 'product-backup-realtime-v2';
export const FEATURE_SCAN_V2 = 'scan-v2';
export const FEATURE_PRODUCT_SCAN_V2 = 'product-scan-v2';
export const FEATURE_PRODUCT_SCAN_V2_NO_SLIDEOUT = 'product-scan-v2-no-slideout';
export const FEATURE_PRODUCT_SCAN_DAILY_V2 = 'product-scan-daily-v2';
export const FEATURE_PRODUCT_SCAN_REALTIME_V2 = 'product-scan-realtime-v2';
export const FEATURE_ANTISPAM_V2 = 'antispam-v2';
export const FEATURE_PRODUCT_ANTISPAM_V2 = 'product-antispam-v2';
export const FEATURE_ACTIVITY_LOG_V2 = 'activity-log-v2';
export const FEATURE_ACTIVITY_LOG_1_YEAR_V2 = 'activity-log-1-year-v2';
export const FEATURE_ACTIVITY_LOG_30_DAYS_V2 = 'activity-log-30-days-v2';
export const FEATURE_SEARCH_V2 = 'search-v2';
export const FEATURE_PRODUCT_SEARCH_V2 = 'product-search-v2';
export const FEATURE_PLAN_SECURITY_DAILY = 'security-daily';
export const FEATURE_PLAN_SECURITY_REALTIME = 'security-realtime';
export const FEATURE_VIDEO_HOSTING_V2 = 'video-hosting-v2';
export const FEATURE_CRM_V2 = 'crm-v2';
export const FEATURE_CRM_LEADS_AND_FUNNEL = 'crm-leads-and-funnel';
export const FEATURE_CRM_PROPOSALS_AND_INVOICES = 'crm-proposals-and-invoices';
export const FEATURE_CRM_TRACK_TRANSACTIONS = 'crm-track-transactions';
export const FEATURE_CRM_NO_CONTACT_LIMITS = 'crm-no-contact-limits';
export const FEATURE_SOCIAL_MEDIA_POSTING_V2 = 'social-media-posting-v2';
export const FEATURE_COLLECT_PAYMENTS_V2 = 'collect-payments-v2';
export const FEATURE_SITE_MONETIZATION_V2 = 'site-monetization-v2';
export const FEATURE_PREMIUM_THEMES_V2 = 'premium-themes-v2';
export const FEATURE_SECURE_STORAGE_V2 = 'secure-storage-v2';
export const FEATURE_ONE_CLICK_RESTORE_V2 = 'one-click-restore-v2';
export const FEATURE_ONE_CLICK_FIX_V2 = 'one-click-fix-v2';
export const FEATURE_INSTANT_EMAIL_V2 = 'instant-email-v2';
export const FEATURE_AKISMET_V2 = 'akismet-v2';
export const FEATURE_SPAM_BLOCK_V2 = 'spam-block-v2';
export const FEATURE_ADVANCED_STATS_V2 = 'advanced-stats-v2';
export const FEATURE_FILTERING_V2 = 'filtering-v2';
export const FEATURE_LANGUAGE_SUPPORT_V2 = 'language-support-v2';
export const FEATURE_SPELLING_CORRECTION_V2 = 'spelling-correction-v2';
