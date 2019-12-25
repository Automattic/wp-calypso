/**
 * Internal dependencies
 */
import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'lib/products-values/constants';

// plans constants
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_BLOGGER = 'blogger-bundle';
export const PLAN_BLOGGER_2_YEARS = 'blogger-bundle-2y';
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
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';
export const PLAN_CHARGEBACK = 'chargeback';

export const NEW_PLANS = [];
export const BEST_VALUE_PLANS = [ PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY ];
export const JETPACK_PLANS = [
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
];
export const JETPACK_MONTHLY_PLANS = [
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
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
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_COMMUNITY_SUPPORT = 'community-support';
export const FEATURE_EMAIL_SUPPORT = 'email-support';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT = 'email-live-chat-support';
export const FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT = 'email-forwarding-extended-limit';
export const FEATURE_PREMIUM_SUPPORT = 'priority-support';
export const FEATURE_BASIC_DESIGN = 'basic-design';
export const FEATURE_ADVANCED_DESIGN = 'advanced-design';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
export const FEATURE_GOOGLE_MY_BUSINESS = 'google-my-business';
export const FEATURE_SFTP = 'sftp';
export const FEATURE_LIVE_CHAT_SUPPORT = 'live-chat-support';
export const FEATURE_NO_ADS = 'no-adverts';
export const FEATURE_VIDEO_UPLOADS = 'video-upload';
export const FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM = 'video-upload-jetpack-premium';
export const FEATURE_VIDEO_UPLOADS_JETPACK_PRO = 'video-upload-jetpack-pro';
export const FEATURE_AUDIO_UPLOADS = 'audio-upload';
export const FEATURE_WORDADS_INSTANT = 'wordads-instant';
export const FEATURE_NO_BRANDING = 'no-wp-branding';
export const FEATURE_ADVANCED_SEO = 'advanced-seo';
export const FEATURE_BUSINESS_ONBOARDING = 'business-onboarding';
export const FEATURE_UPLOAD_PLUGINS = 'upload-plugins';
export const FEATURE_UPLOAD_THEMES = 'upload-themes';
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
export const FEATURE_WP_SUBDOMAIN_SIGNUP = 'wordpress-subdomain-signup';
export const FEATURE_ADVANCED_SEO_TOOLS = 'advanced-seo-tools';
export const FEATURE_FREE_THEMES_SIGNUP = 'free-themes-signup';
export const FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP = 'unlimited-backup';
export const FEATURE_MEMBERSHIPS = 'memberships';

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
export const FEATURE_PRIORITY_SUPPORT_JETPACK = 'priority-support-jetpack';
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

// Meta grouping constants
export const GROUP_WPCOM = 'GROUP_WPCOM';
export const GROUP_JETPACK = 'GROUP_JETPACK';

export const TERM_MONTHLY = 'TERM_MONTHLY';
export const TERM_ANNUALLY = 'TERM_ANNUALLY';
export const TERM_BIENNIALLY = 'TERM_BIENNIALLY';

export const TYPE_FREE = 'TYPE_FREE';
export const TYPE_BLOGGER = 'TYPE_BLOGGER';
export const TYPE_PERSONAL = 'TYPE_PERSONAL';
export const TYPE_PREMIUM = 'TYPE_PREMIUM';
export const TYPE_BUSINESS = 'TYPE_BUSINESS';
export const TYPE_ECOMMERCE = 'TYPE_ECOMMERCE';

export function isMonthly( plan ) {
	return plan === PLAN_BUSINESS_MONTHLY || JETPACK_MONTHLY_PLANS.includes( plan );
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
