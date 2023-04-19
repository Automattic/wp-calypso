import i18n from 'i18n-calypso';
import {
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_PAGES,
	FEATURE_USERS,
	FEATURE_POST_EDITS_HISTORY,
	FEATURE_ALWAYS_ONLINE,
	FEATURE_STATS_JP,
	FEATURE_CONTACT_FORM_JP,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_SUPPORT_EMAIL,
	FEATURE_BANDWIDTH,
	FEATURE_GROUP_PERFORMANCE_BOOSTERS,
	FEATURE_FAST_DNS,
	FEATURE_BURST,
	FEATURE_CPUS,
	FEATURE_CDN,
	FEATURE_GROUP_HIGH_AVAILABILITY,
	FEATURE_ONE_CLICK_RESTORE_V2,
	FEATURE_REALTIME_BACKUPS_JP,
	FEATURE_DATACENTRE_FAILOVER,
	FEATURE_GROUP_DEVELOPER_TOOLS,
	FEATURE_DEV_TOOLS,
	FEATURE_MULTI_SITE,
	FEATURE_WP_UPDATES,
	FEATURE_GROUP_SECURITY_AND_SAFETY,
	FEATURE_SECURITY_BRUTE_FORCE,
	FEATURE_ISOLATED_INFRA,
	FEATURE_SPAM_JP,
	FEATURE_SECURITY_DDOS,
	FEATURE_SECURITY_MALWARE,
	FEATURE_WAF_V2,
	FEATURE_GROUP_THEMES_AND_CUSTOMIZATION,
	FEATURE_BEAUTIFUL_THEMES,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_PREMIUM_THEMES_V2,
	FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS,
	FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS,
	FEATURE_SELL_SHIP,
	FEATURE_CUSTOM_STORE,
	FEATURE_INVENTORY,
	FEATURE_CHECKOUT,
	FEATURE_ACCEPT_PAYMENTS_V2,
	FEATURE_SALES_REPORTS,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_EXTENSIONS,
	FEATURE_NEWSLETTERS_RSS,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_WORDADS,
	FEATURE_SEO_JP,
	FEATURE_VIDEOPRESS_JP,
	FEATURE_PREMIUM_CONTENT_JP,
	FEATURE_PAID_SUBSCRIBERS_JP,
	FEATURE_SHARES_SOCIAL_MEDIA_JP,
	FEATURE_PLUGINS_THEMES,
	FEATURE_PLUGIN_AUTOUPDATE_JP,
	FEATURE_GLOBAL_EDGE_CACHING,
	FEATURE_ES_SEARCH_JP,
	FEATURE_SMART_REDIRECTS,
	FEATURE_SITE_ACTIVITY_LOG_JP,
	FEATURE_UPTIME_MONITOR_JP,
	FEATURE_GROUP_YOUR_STORE,
	FEATURE_WOOCOMMERCE_STORE,
	FEATURE_WOOCOMMERCE_MOBILE_APP,
	FEATURE_WORDPRESS_CMS,
	FEATURE_WORDPRESS_MOBILE_APP,
	FEATURE_FREE_SSL_CERTIFICATE,
	FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_EMAIL_SUPPORT,
	FEATURE_GOOGLE_ANALYTICS_V3,
	FEATURE_GROUP_PRODUCTS,
	FEATURE_LIST_UNLIMITED_PRODUCTS,
	FEATURE_GIFT_CARDS,
	FEATURE_MIN_MAX_ORDER_QUANTITY,
	FEATURE_PRODUCT_BUNDLES,
	FEATURE_CUSTOM_PRODUCT_KITS,
	FEATURE_LIST_PRODUCTS_BY_BRAND,
	FEATURE_PRODUCT_RECOMMENDATIONS,
	FEATURE_GROUP_PAYMENTS,
	FEATURE_INTEGRATED_PAYMENTS,
	FEATURE_INTERNATIONAL_PAYMENTS,
	FEATURE_AUTOMATED_SALES_TAXES,
	FEATURE_ACCEPT_LOCAL_PAYMENTS,
	FEATURE_GROUP_MARKETING_EMAIL,
	FEATURE_PROMOTE_ON_TIKTOK,
	FEATURE_SYNC_WITH_PINTEREST,
	FEATURE_CONNECT_WITH_FACEBOOK,
	FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
	FEATURE_MARKETING_AUTOMATION,
	FEATURE_ABANDONED_CART_RECOVERY,
	FEATURE_ADVANCED_SEO_TOOLS,
	FEATURE_ADVERTISE_ON_GOOGLE,
	FEATURE_REFERRAL_PROGRAMS,
	FEATURE_CUSTOMER_BIRTHDAY_EMAILS,
	FEATURE_CUSTOM_ORDER_EMAILS,
	FEATURE_LOYALTY_POINTS_PROGRAMS,
	FEATURE_GROUP_SHIPPING,
	FEATURE_INTEGRATED_SHIPMENT_TRACKING,
	FEATURE_LIVE_SHIPPING_RATES,
	FEATURE_DISCOUNTED_SHIPPING,
	FEATURE_PRINT_SHIPPING_LABELS,
	FEATURE_RECURRING_PAYMENTS,
} from './constants';
import { FeatureGroupMap } from './types';

export const featureGroups: Partial< FeatureGroupMap > = {
	[ FEATURE_GROUP_ESSENTIAL_FEATURES ]: {
		slug: FEATURE_GROUP_ESSENTIAL_FEATURES,
		getTitle: () => i18n.translate( 'Essential features' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_PAGES,
			FEATURE_USERS,
			FEATURE_POST_EDITS_HISTORY,
			FEATURE_ALWAYS_ONLINE,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_BANDWIDTH,
			FEATURE_STATS_JP,
			FEATURE_SUPPORT_EMAIL,
			FEATURE_LIVE_CHAT_SUPPORT,
			FEATURE_PLUGINS_THEMES,
			FEATURE_PLUGIN_AUTOUPDATE_JP,
			FEATURE_CONTACT_FORM_JP,
			FEATURE_ES_SEARCH_JP,
			FEATURE_SMART_REDIRECTS,
		],
	},
	[ FEATURE_GROUP_PERFORMANCE_BOOSTERS ]: {
		slug: FEATURE_GROUP_PERFORMANCE_BOOSTERS,
		getTitle: () => i18n.translate( 'Performance boosters' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_FAST_DNS,
			FEATURE_BURST,
			FEATURE_CPUS,
			FEATURE_GLOBAL_EDGE_CACHING,
			FEATURE_CDN,
		],
	},
	[ FEATURE_GROUP_HIGH_AVAILABILITY ]: {
		slug: FEATURE_GROUP_HIGH_AVAILABILITY,
		getTitle: () => i18n.translate( 'High Availability' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_DATACENTRE_FAILOVER,
			FEATURE_ONE_CLICK_RESTORE_V2,
			FEATURE_REALTIME_BACKUPS_JP,
			FEATURE_UPTIME_MONITOR_JP,
		],
	},
	[ FEATURE_GROUP_DEVELOPER_TOOLS ]: {
		slug: FEATURE_GROUP_DEVELOPER_TOOLS,
		getTitle: () => i18n.translate( 'Developer tools' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_DEV_TOOLS,
			FEATURE_MULTI_SITE,
			FEATURE_WP_UPDATES,
		],
	},
	[ FEATURE_GROUP_SECURITY_AND_SAFETY ]: {
		slug: FEATURE_GROUP_SECURITY_AND_SAFETY,
		getTitle: () => i18n.translate( 'Security and safety' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_SECURITY_BRUTE_FORCE,
			FEATURE_ISOLATED_INFRA,
			FEATURE_SPAM_JP,
			FEATURE_SECURITY_DDOS,
			FEATURE_SECURITY_MALWARE,
			FEATURE_WAF_V2,
			FEATURE_SITE_ACTIVITY_LOG_JP,
		],
	},
	[ FEATURE_GROUP_THEMES_AND_CUSTOMIZATION ]: {
		slug: FEATURE_GROUP_THEMES_AND_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Design customization' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_BEAUTIFUL_THEMES,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_PREMIUM_THEMES_V2,
		],
	},

	[ FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS ]: {
		slug: FEATURE_GROUP_SUPERIOR_COMMERCE_SOLUTIONS,
		getTitle: () => i18n.translate( 'Commerce solutions' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_SELL_SHIP,
			FEATURE_CUSTOM_STORE,
			FEATURE_INVENTORY,
			FEATURE_CHECKOUT,
			FEATURE_ACCEPT_PAYMENTS_V2,
			FEATURE_SALES_REPORTS,
			FEATURE_SHIPPING_CARRIERS,
			FEATURE_EXTENSIONS,
		],
	},
	[ FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS ]: {
		slug: FEATURE_GROUP_MARKETING_GROWTH_AND_MONETIZATION_TOOLS,
		getTitle: () => i18n.translate( 'Growth and monetization tools' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_NEWSLETTERS_RSS,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_WORDADS,
			FEATURE_SHARES_SOCIAL_MEDIA_JP,
			FEATURE_SEO_JP,
			FEATURE_VIDEOPRESS_JP,
			FEATURE_PREMIUM_CONTENT_JP,
			FEATURE_PAID_SUBSCRIBERS_JP,
		],
	},
};

export const wooExpressFeatureGroups: Partial< FeatureGroupMap > = {
	[ FEATURE_GROUP_YOUR_STORE ]: {
		slug: FEATURE_GROUP_YOUR_STORE,
		getTitle: () => i18n.translate( 'Your store' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_WOOCOMMERCE_STORE,
			FEATURE_WOOCOMMERCE_MOBILE_APP,
			FEATURE_WORDPRESS_CMS,
			FEATURE_WORDPRESS_MOBILE_APP,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_FREE_SSL_CERTIFICATE,
			FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_UNLIMITED_ADMINS,
			FEATURE_LIVE_CHAT_SUPPORT,
			FEATURE_EMAIL_SUPPORT,
			FEATURE_PREMIUM_THEMES_V2,
			FEATURE_SALES_REPORTS,
			FEATURE_GOOGLE_ANALYTICS_V3,
		],
	},
	[ FEATURE_GROUP_PRODUCTS ]: {
		slug: FEATURE_GROUP_PRODUCTS,
		getTitle: () => i18n.translate( 'Products' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_LIST_UNLIMITED_PRODUCTS,
			FEATURE_GIFT_CARDS,
			FEATURE_MIN_MAX_ORDER_QUANTITY,
			FEATURE_PRODUCT_BUNDLES,
			FEATURE_CUSTOM_PRODUCT_KITS,
			FEATURE_LIST_PRODUCTS_BY_BRAND,
			FEATURE_PRODUCT_RECOMMENDATIONS,
		],
	},
	[ FEATURE_GROUP_PAYMENTS ]: {
		slug: FEATURE_GROUP_PAYMENTS,
		getTitle: () => i18n.translate( 'Payments' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_INTEGRATED_PAYMENTS,
			FEATURE_INTERNATIONAL_PAYMENTS,
			FEATURE_AUTOMATED_SALES_TAXES,
			FEATURE_ACCEPT_LOCAL_PAYMENTS,
			FEATURE_RECURRING_PAYMENTS,
		],
	},
	[ FEATURE_GROUP_MARKETING_EMAIL ]: {
		slug: FEATURE_GROUP_MARKETING_EMAIL,
		getTitle: () => i18n.translate( 'Marketing & Email' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_PROMOTE_ON_TIKTOK,
			FEATURE_SYNC_WITH_PINTEREST,
			FEATURE_CONNECT_WITH_FACEBOOK,
			FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
			FEATURE_MARKETING_AUTOMATION,
			FEATURE_ABANDONED_CART_RECOVERY,
			FEATURE_ADVANCED_SEO_TOOLS,
			FEATURE_ADVERTISE_ON_GOOGLE,
			FEATURE_REFERRAL_PROGRAMS,
			FEATURE_CUSTOMER_BIRTHDAY_EMAILS,
			FEATURE_CUSTOM_ORDER_EMAILS,
			FEATURE_LOYALTY_POINTS_PROGRAMS,
		],
	},
	[ FEATURE_GROUP_SHIPPING ]: {
		slug: FEATURE_GROUP_SHIPPING,
		getTitle: () => i18n.translate( 'Shipping' ),
		get2023PricingGridSignupWpcomFeatures: () => [
			FEATURE_INTEGRATED_SHIPMENT_TRACKING,
			FEATURE_LIVE_SHIPPING_RATES,
			FEATURE_DISCOUNTED_SHIPPING,
			FEATURE_PRINT_SHIPPING_LABELS,
		],
	},
};
