/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';

export const TITAN_MAIL_MONTHLY_SLUG = 'wp_titan_mail_monthly';

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

export const WPCOM_TRAFFIC_GUIDE = 'traffic-guide';

// If JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN is true, checkout will redirect to the site's wp-admin,
// otherwise it will redirect to the JETPACK_REDIRECT_URL. Checkout references these constants in:
// client/my-sites/checkout/composite-checkout/hooks/use-get-thank-you-url/get-thank-you-page-url.ts
export const JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN = true;
export const JETPACK_REDIRECT_URL =
	'https://jetpack.com/redirect/?source=jetpack-checkout-thankyou';
export const redirectCloudCheckoutToWpAdmin = () => !! JETPACK_CLOUD_REDIRECT_CHECKOUT_TO_WPADMIN;

// plans constants
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
export const PLAN_JETPACK_FREE = 'jetpack_free';
export const PLAN_JETPACK_PREMIUM = 'jetpack_premium';
export const PLAN_JETPACK_BUSINESS = 'jetpack_business';
export const PLAN_JETPACK_PERSONAL = 'jetpack_personal';
export const PLAN_JETPACK_PREMIUM_MONTHLY = 'jetpack_premium_monthly';
export const PLAN_JETPACK_BUSINESS_MONTHLY = 'jetpack_business_monthly';
export const PLAN_JETPACK_PERSONAL_MONTHLY = 'jetpack_personal_monthly';
export const PLAN_JETPACK_SECURITY_DAILY = 'jetpack_security_daily';
export const PLAN_JETPACK_SECURITY_DAILY_MONTHLY = 'jetpack_security_daily_monthly';
export const PLAN_JETPACK_SECURITY_REALTIME = 'jetpack_security_realtime';
export const PLAN_JETPACK_SECURITY_REALTIME_MONTHLY = 'jetpack_security_realtime_monthly';
export const PLAN_JETPACK_COMPLETE = 'jetpack_complete';
export const PLAN_JETPACK_COMPLETE_MONTHLY = 'jetpack_complete_monthly';
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';
export const PLAN_CHARGEBACK = 'chargeback';
export const PLAN_VIP = 'vip';
export const PLAN_P2_PLUS = 'wp_p2_plus_monthly';
export const PLAN_P2_FREE = 'p2_free_plan'; // Not a real plan; it's a renamed WP.com Free for the P2 project.

export const PLAN_BUSINESS_ONBOARDING_EXPIRE = '2021-07-31T00:00:00+00:00';
export const PLAN_BUSINESS_2Y_ONBOARDING_EXPIRE = '2022-07-31T00:00:00+00:00';

export const NEW_PLANS = [];
export const BEST_VALUE_PLANS = [ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ];

export const WPCOM_MONTHLY_PLANS = [
	PLAN_BUSINESS_MONTHLY,
	PLAN_PREMIUM_MONTHLY,
	PLAN_PERSONAL_MONTHLY,
	PLAN_ECOMMERCE_MONTHLY,
];

export const JETPACK_MONTHLY_PLANS = [
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_COMPLETE_MONTHLY,
];
export const JETPACK_LEGACY_PLANS = [
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
];
export const JETPACK_SECURITY_PLANS = [
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
];
export const JETPACK_COMPLETE_PLANS = [ PLAN_JETPACK_COMPLETE, PLAN_JETPACK_COMPLETE_MONTHLY ];
export const JETPACK_RESET_PLANS = [ ...JETPACK_SECURITY_PLANS, ...JETPACK_COMPLETE_PLANS ];
export const JETPACK_PLANS = [
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	...JETPACK_RESET_PLANS,
];

export const JETPACK_RESET_PLANS_BY_TERM = [
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
];

export const JETPACK_PLANS_BY_TERM = [
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

export const PLAN_MONTHLY_PERIOD = 31;
export const PLAN_ANNUAL_PERIOD = 365;
export const PLAN_BIENNIAL_PERIOD = 730;

// features constants
export const FEATURE_WP_SUBDOMAIN = 'wordpress-subdomain';
export const FEATURE_BLOG_DOMAIN = 'blog-domain';
export const FEATURE_CUSTOM_DOMAIN = 'custom-domain';
export const FEATURE_JETPACK_ESSENTIAL = 'jetpack-essential';
export const FEATURE_JETPACK_ADVANCED = 'jetpack-advanced';
export const FEATURE_FREE_THEMES = 'free-themes';
export const FEATURE_UNLIMITED_PREMIUM_THEMES = 'premium-themes';
export const FEATURE_3GB_STORAGE = '3gb-storage';
export const FEATURE_6GB_STORAGE = '6gb-storage';
export const FEATURE_13GB_STORAGE = '13gb-storage';
export const FEATURE_200GB_STORAGE = '200gb-storage';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_COMMUNITY_SUPPORT = 'community-support';
export const FEATURE_EMAIL_SUPPORT = 'email-support';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT = 'email-live-chat-support';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS =
	'email-live-chat-support-business-days';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS = 'email-live-chat-support-all-days';
export const FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS = 'live-chat-support-all-days';
export const FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS = 'live-chat-support-business-days';
export const FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT = 'email-forwarding-extended-limit';
export const FEATURE_PREMIUM_SUPPORT = 'priority-support';
export const FEATURE_BASIC_DESIGN = 'basic-design';
export const FEATURE_ADVANCED_DESIGN = 'advanced-design';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
export const FEATURE_CLOUDFLARE_ANALYTICS = 'cloudflare-analytics';
export const FEATURE_GOOGLE_MY_BUSINESS = 'google-my-business';
export const FEATURE_SFTP = 'sftp';
export const FEATURE_LIVE_CHAT_SUPPORT = 'live-chat-support';
export const FEATURE_NO_ADS = 'no-adverts';
export const FEATURE_UPLOAD_VIDEO = 'upload-video';
export const FEATURE_VIDEO_UPLOADS = 'video-upload';
export const FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM = 'video-upload-jetpack-premium';
export const FEATURE_VIDEO_UPLOADS_JETPACK_PRO = 'video-upload-jetpack-pro';
export const FEATURE_AUDIO_UPLOADS = 'audio-upload';
export const FEATURE_WORDADS_INSTANT = 'wordads-instant';
export const FEATURE_NO_BRANDING = 'no-wp-branding';
export const FEATURE_ADVANCED_SEO = 'advanced-seo';
export const FEATURE_BUSINESS_ONBOARDING = 'business-onboarding';
export const FEATURE_UPLOAD_PLUGINS = 'upload-plugins';
export const FEATURE_INSTALL_PLUGINS = 'install-plugins';
export const FEATURE_UPLOAD_THEMES = 'upload-themes';
export const FEATURE_PERFORMANCE = 'performance';
export const FEATURE_REPUBLICIZE = 'republicize';
export const FEATURE_SIMPLE_PAYMENTS = 'simple-payments';
export const FEATURE_ALL_FREE_FEATURES = 'all-free-features';
export const FEATURE_ALL_FREE_FEATURES_JETPACK = 'all-free-features-jetpack';
export const FEATURE_ALL_PERSONAL_FEATURES = 'all-personal-features';
export const FEATURE_ALL_PERSONAL_FEATURES_JETPACK = 'all-personal-features-jetpack';
export const FEATURE_ALL_PREMIUM_FEATURES = 'all-premium-features';
export const FEATURE_ALL_PREMIUM_FEATURES_JETPACK = 'all-premium-features-jetpack';
export const FEATURE_ADVANCED_CUSTOMIZATION = 'advanced-customization';
export const FEATURE_PREMIUM_THEMES = 'unlimited-premium-themes';
export const FEATURE_UPLOAD_THEMES_PLUGINS = 'upload-themes-and-plugins';
export const FEATURE_GOOGLE_ANALYTICS_SIGNUP = 'google-analytics-signup';
export const FEATURE_FREE_DOMAIN = 'free-custom-domain';
export const FEATURE_FREE_BLOG_DOMAIN = 'free-blog-domain';
export const FEATURE_UNLIMITED_STORAGE_SIGNUP = 'unlimited-storage-signup';
export const FEATURE_EMAIL_SUPPORT_SIGNUP = 'email-support-signup';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP = 'email-live-chat-support-signup';
export const FEATURE_MONETISE = 'monetise-your-site';
export const FEATURE_EARN_AD = 'earn-ad-revenue';
export const FEATURE_WP_SUBDOMAIN_SIGNUP = 'wordpress-subdomain-signup';
export const FEATURE_ADVANCED_SEO_TOOLS = 'advanced-seo-tools';
export const FEATURE_ADVANCED_SEO_EXPANDED_ABBR = 'advanced-seo-expanded-abbreviation';
export const FEATURE_FREE_THEMES_SIGNUP = 'free-themes-signup';
export const FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP = 'unlimited-backup';
export const FEATURE_MEMBERSHIPS = 'memberships';
export const FEATURE_PREMIUM_CONTENT_BLOCK = 'premium-content-block';
export const FEATURE_HOSTING = 'hosting';
export const PREMIUM_DESIGN_FOR_STORES = 'premium-design-for-stores';
export const FEATURE_SFTP_DATABASE = 'sftp-and-database-access';
export const FEATURE_SITE_BACKUPS_AND_RESTORE = 'site-backups-and-restore';

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

// P2 project features
export const FEATURE_P2_3GB_STORAGE = 'p2-3gb-storage';
export const FEATURE_P2_UNLIMITED_USERS = 'p2-unlimited-users';
export const FEATURE_P2_UNLIMITED_POSTS_PAGES = 'p2-unlimited-posts-pages';
export const FEATURE_P2_SIMPLE_SEARCH = 'p2-simple-search';
export const FEATURE_P2_CUSTOMIZATION_OPTIONS = 'p2-customization-options';
export const FEATURE_P2_13GB_STORAGE = 'p2-13gb-storage';
export const FEATURE_P2_ADVANCED_SEARCH = 'p2-advanced-search';
export const FEATURE_P2_VIDEO_SHARING = 'p2-video-sharing';
export const FEATURE_P2_MORE_FILE_TYPES = 'p2-more-file-types';
export const FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT = 'p2-priority-chat-email-support';
export const FEATURE_P2_ACTIVITY_OVERVIEW = 'p2-activity-overview';
export const FEATURE_P2_CUSTOM_DOMAIN = 'p2-custom-domain';

// Meta grouping constants
export const GROUP_WPCOM = 'GROUP_WPCOM';
export const GROUP_JETPACK = 'GROUP_JETPACK';

export const TERM_MONTHLY = 'TERM_MONTHLY';
export const TERM_ANNUALLY = 'TERM_ANNUALLY';
export const TERM_BIENNIALLY = 'TERM_BIENNIALLY';
export const TERMS_LIST = [ TERM_MONTHLY, TERM_ANNUALLY, TERM_BIENNIALLY ];

export const TYPE_FREE = 'TYPE_FREE';
export const TYPE_BLOGGER = 'TYPE_BLOGGER';
export const TYPE_PERSONAL = 'TYPE_PERSONAL';
export const TYPE_PREMIUM = 'TYPE_PREMIUM';
export const TYPE_BUSINESS = 'TYPE_BUSINESS';
export const TYPE_ECOMMERCE = 'TYPE_ECOMMERCE';
export const TYPE_SECURITY_DAILY = 'TYPE_SECURITY_DAILY';
export const TYPE_SECURITY_REALTIME = 'TYPE_SECURITY_REALTIME';
export const TYPE_ALL = 'TYPE_ALL';
export const TYPE_P2_PLUS = 'TYPE_P2_PLUS';

export const STORE_DEPRECATION_START_DATE = new Date( '2021-01-19T19:30:00+00:00' );

export function isMonthly( plan ) {
	return WPCOM_MONTHLY_PLANS.includes( plan ) || JETPACK_MONTHLY_PLANS.includes( plan );
}

export function isNew( plan ) {
	return NEW_PLANS.includes( plan );
}

export function isBestValue( plan ) {
	return BEST_VALUE_PLANS.includes( plan );
}

/**
 * Return estimated duration of given PLAN_TERM in days
 *
 * @param {string} term TERM_ constant
 * @returns {number} Term duration
 */
export function getTermDuration( term ) {
	switch ( term ) {
		case TERM_MONTHLY:
			return PLAN_MONTHLY_PERIOD;

		case TERM_ANNUALLY:
			return PLAN_ANNUAL_PERIOD;

		case TERM_BIENNIALLY:
			return PLAN_BIENNIAL_PERIOD;
	}

	if ( process.env.NODE_ENV === 'development' ) {
		console.error( `Unexpected argument ${ term }, expected one of TERM_ constants` ); // eslint-disable-line no-console
	}
}
