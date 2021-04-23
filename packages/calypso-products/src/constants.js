export const TITAN_MAIL_MONTHLY_SLUG = 'wp_titan_mail_monthly';

export const domainProductSlugs = {
	TRANSFER_IN: 'domain_transfer',
};

export const GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY =
	'wp_google_workspace_business_starter_yearly';
export const GSUITE_BASIC_SLUG = 'gapps';
export const GSUITE_BUSINESS_SLUG = 'gapps_unlimited';
export const GSUITE_EXTRA_LICENSE_SLUG = 'gapps_extra_license';

export const WPCOM_TRAFFIC_GUIDE = 'traffic-guide';

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
