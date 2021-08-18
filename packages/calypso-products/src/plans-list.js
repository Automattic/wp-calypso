import { isEnabled } from '@automattic/calypso-config';
import i18n, { translate } from 'i18n-calypso';
import React from 'react';
import {
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_ACTIVITY_LOG,
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_ADVANCED_CUSTOMIZATION,
	FEATURE_ADVANCED_DESIGN,
	FEATURE_ADVANCED_SEO,
	FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
	FEATURE_ADVANCED_SEO_TOOLS,
	FEATURE_ALL_BUSINESS_FEATURES,
	FEATURE_ALL_FREE_FEATURES,
	FEATURE_ALL_FREE_FEATURES_JETPACK,
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_ALL_PREMIUM_FEATURES,
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	FEATURE_ANTISPAM_V2,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_AUTOMATED_RESTORES,
	FEATURE_AUTOMATIC_SECURITY_FIXES,
	FEATURE_BACKUP_ARCHIVE_30,
	FEATURE_BACKUP_ARCHIVE_UNLIMITED,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
	FEATURE_BASIC_DESIGN,
	FEATURE_BLANK,
	FEATURE_BLOG_DOMAIN,
	FEATURE_BUSINESS_ONBOARDING,
	FEATURE_CLOUDFLARE_ANALYTICS,
	FEATURE_COLLECT_PAYMENTS_V2,
	FEATURE_COMMUNITY_SUPPORT,
	FEATURE_CRM_V2,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_EARN_AD,
	FEATURE_EASY_SITE_MIGRATION,
	FEATURE_ECOMMERCE_MARKETING,
	FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
	FEATURE_EMAIL_SUPPORT,
	FEATURE_EMAIL_SUPPORT_SIGNUP,
	FEATURE_FREE_BLOG_DOMAIN,
	FEATURE_FREE_DOMAIN,
	FEATURE_FREE_THEMES,
	FEATURE_FREE_THEMES_SIGNUP,
	FEATURE_FREE_WORDPRESS_THEMES,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_GOOGLE_MY_BUSINESS,
	FEATURE_HOSTING,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_CRM,
	FEATURE_JETPACK_CRM_MONTHLY,
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
	FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
	FEATURE_MALWARE_SCANNING_DAILY,
	FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
	FEATURE_MANAGE,
	FEATURE_MEMBERSHIPS,
	FEATURE_MONETISE,
	FEATURE_NO_ADS,
	FEATURE_NO_BRANDING,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
	FEATURE_ONE_CLICK_THREAT_RESOLUTION,
	FEATURE_P2_13GB_STORAGE,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_ACTIVITY_OVERVIEW,
	FEATURE_P2_ADVANCED_SEARCH,
	FEATURE_P2_CUSTOMIZATION_OPTIONS,
	FEATURE_P2_MORE_FILE_TYPES,
	FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
	FEATURE_P2_SIMPLE_SEARCH,
	FEATURE_P2_UNLIMITED_POSTS_PAGES,
	FEATURE_P2_UNLIMITED_USERS,
	FEATURE_P2_VIDEO_SHARING,
	FEATURE_PLAN_SECURITY_DAILY,
	FEATURE_PREMIUM_CONTENT_BLOCK,
	FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_PREMIUM_THEMES,
	FEATURE_PRODUCT_BACKUP_DAILY_V2,
	FEATURE_PRODUCT_BACKUP_REALTIME_V2,
	FEATURE_PRODUCT_SCAN_DAILY_V2,
	FEATURE_PRODUCT_SCAN_REALTIME_V2,
	FEATURE_PRODUCT_SEARCH_V2,
	FEATURE_REPUBLICIZE,
	FEATURE_SCAN_V2,
	FEATURE_SEO_PREVIEW_TOOLS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_SITE_STATS,
	FEATURE_SPAM_AKISMET_PLUS,
	FEATURE_STANDARD_SECURITY_TOOLS,
	FEATURE_TRAFFIC_TOOLS,
	FEATURE_UNLIMITED_PREMIUM_THEMES,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_VIDEO_HOSTING_V2,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
	FEATURE_WP_SUBDOMAIN,
	FEATURE_WP_SUBDOMAIN_SIGNUP,
	GROUP_JETPACK,
	GROUP_WPCOM,
	JETPACK_LEGACY_PLANS,
	JETPACK_SECURITY_PLANS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_P2_FREE,
	PLAN_P2_PLUS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PREMIUM_DESIGN_FOR_STORES,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TYPE_ALL,
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_FREE,
	TYPE_P2_PLUS,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_SECURITY_DAILY,
	TYPE_SECURITY_REALTIME,
	TYPE_SECURITY_T1,
	TYPE_SECURITY_T2,
} from './constants';

function compact( elements ) {
	return elements.filter( Boolean );
}

const WPComGetBillingTimeframe = () => i18n.translate( 'per month, billed annually' );
const WPComGetBiennialBillingTimeframe = () => i18n.translate( '/month, billed every two years' );

const getAnnualTimeframe = () => ( {
	term: TERM_ANNUALLY,
	getBillingTimeFrame: () => translate( 'per year' ),
} );

const getMonthlyTimeframe = () => ( {
	term: TERM_MONTHLY,
	getBillingTimeFrame: () => translate( 'per month, billed monthly' ),
} );

const getDotcomPlanDetails = () => ( {
	// Features only available for annual plans
	getAnnualPlansOnlyFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		FEATURE_LIVE_CHAT_SUPPORT,
		FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
	],
} );

/* eslint-disable wpcalypso/jsx-classname-namespace */
const plansDescriptionHeadingComponent = {
	components: {
		strong: <strong className="plans__features plan-features__targeted-description-heading" />,
	},
};
/* eslint-enable */

const getPlanBloggerDetails = () => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_BLOGGER,
	getTitle: () => i18n.translate( 'Blogger' ),
	// @TODO not updating copy for now, we need to update it after the first round of design {{{
	getAudience: () => i18n.translate( 'Best for bloggers' ),
	getBlogAudience: () => i18n.translate( 'Best for bloggers' ),
	getPortfolioAudience: () => i18n.translate( 'Best for bloggers' ),
	getStoreAudience: () => i18n.translate( 'Best for bloggers' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for bloggers:{{/strong}} Brand your blog with a custom .blog domain name, and remove all WordPress.com advertising. Receive additional storage space and customer support via email.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Brand your blog with a custom .blog domain name, and remove all WordPress.com advertising. Receive additional storage space and customer support via email.'
		),
	// }}}
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		FEATURE_BLOG_DOMAIN,
		FEATURE_JETPACK_ESSENTIAL,
		FEATURE_EMAIL_SUPPORT,
		FEATURE_FREE_THEMES,
		FEATURE_BASIC_DESIGN,
		FEATURE_6GB_STORAGE,
		FEATURE_NO_ADS,
		FEATURE_MEMBERSHIPS,
		FEATURE_PREMIUM_CONTENT_BLOCK,
	],
	getSignupFeatures: () => [
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_BLOG_DOMAIN,
		FEATURE_ALL_FREE_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_FREE_BLOG_DOMAIN,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_FREE_BLOG_DOMAIN,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanPersonalDetails = () => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_PERSONAL,
	getTitle: () => i18n.translate( 'Personal' ),
	getAudience: () => i18n.translate( 'Best for personal use' ),
	getBlogAudience: () => i18n.translate( 'Best for personal use' ),
	getPortfolioAudience: () => i18n.translate( 'Best for personal use' ),
	getStoreAudience: () => i18n.translate( 'Best for personal use' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for personal use:{{/strong}} Boost your' +
				' website with a custom domain name, and remove all WordPress.com advertising. ' +
				'Unlock unlimited, expert customer support via email.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Boost your website with a custom domain name, and remove all WordPress.com advertising. ' +
				'Unlock unlimited, expert customer support via email.'
		),
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_HOSTING,
		FEATURE_JETPACK_ESSENTIAL,
		FEATURE_EMAIL_SUPPORT,
		FEATURE_FREE_THEMES,
		FEATURE_BASIC_DESIGN,
		FEATURE_6GB_STORAGE,
		FEATURE_NO_ADS,
		FEATURE_MEMBERSHIPS,
		FEATURE_PREMIUM_CONTENT_BLOCK,
	],
	getSignupFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_FREE_THEMES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	getSignupCompareAvailableFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_HOSTING,
		FEATURE_NO_ADS,
		FEATURE_COLLECT_PAYMENTS_V2,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanEcommerceDetails = () => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_ECOMMERCE,
	getTitle: () => i18n.translate( 'eCommerce' ),
	getAudience: () => i18n.translate( 'Best for online stores' ),
	getBlogAudience: () => i18n.translate( 'Best for online stores' ),
	getPortfolioAudience: () => i18n.translate( 'Best for online stores' ),
	getStoreAudience: () => i18n.translate( 'Best for online stores' ),
	getDescription: () => {
		return i18n.translate(
			'{{strong}}Best for online stores:{{/strong}} Sell products or services with this powerful, ' +
				'all-in-one online store experience. This plan includes premium integrations and is extendable, ' +
				'so it’ll grow with you as your business grows.',
			plansDescriptionHeadingComponent
		);
	},
	getShortDescription: () =>
		i18n.translate(
			'Sell products or services with this powerful, ' +
				'all-in-one online store experience. This plan includes premium integrations and is extendable, ' +
				'so it’ll grow with you as your business grows.'
		),
	getTagline: () =>
		i18n.translate(
			'Learn more about everything included with eCommerce and take advantage of its powerful marketplace features.'
		),
	getPlanCompareFeatures: ( _, { isLoggedInMonthlyPricing } = {} ) =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			FEATURE_HOSTING,
			FEATURE_JETPACK_ADVANCED,
			! isLoggedInMonthlyPricing && FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_200GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_BUSINESS_ONBOARDING,
			FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_PLUGINS,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_THEMES,
			FEATURE_NO_BRANDING,
			FEATURE_ACCEPT_PAYMENTS,
			FEATURE_SHIPPING_CARRIERS,
			FEATURE_UNLIMITED_PRODUCTS_SERVICES,
			FEATURE_ECOMMERCE_MARKETING,
			FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		] ),
	getPromotedFeatures: () => [
		FEATURE_200GB_STORAGE,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_DESIGN,
		FEATURE_BUSINESS_ONBOARDING,
	],
	getSignupFeatures: () => [
		FEATURE_ACCEPT_PAYMENTS,
		FEATURE_SHIPPING_CARRIERS,
		FEATURE_ALL_BUSINESS_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_ACCEPT_PAYMENTS,
		FEATURE_SHIPPING_CARRIERS,
		FEATURE_ALL_BUSINESS_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_ACCEPT_PAYMENTS,
		FEATURE_SHIPPING_CARRIERS,
		FEATURE_ALL_BUSINESS_FEATURES,
	],
	getSignupCompareAvailableFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_HOSTING,
		FEATURE_NO_ADS,
		FEATURE_COLLECT_PAYMENTS_V2,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
		FEATURE_EARN_AD,
		FEATURE_PREMIUM_THEMES,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_INSTALL_PLUGINS,
		FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		FEATURE_SITE_BACKUPS_AND_RESTORE,
		FEATURE_SFTP_DATABASE,
		FEATURE_ACCEPT_PAYMENTS,
		FEATURE_SHIPPING_CARRIERS,
		PREMIUM_DESIGN_FOR_STORES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [
		FEATURE_AUDIO_UPLOADS,
		FEATURE_GOOGLE_MY_BUSINESS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
		FEATURE_SEO_PREVIEW_TOOLS,
	],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanPremiumDetails = () => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_PREMIUM,
	getTitle: () => i18n.translate( 'Premium' ),
	getAudience: () => i18n.translate( 'Best for freelancers' ),
	getBlogAudience: () => i18n.translate( 'Best for freelancers' ),
	getPortfolioAudience: () => i18n.translate( 'Best for freelancers' ),
	getStoreAudience: () => i18n.translate( 'Best for freelancers' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for freelancers:{{/strong}} Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
				' Google Analytics support,' +
				' and the ability to monetize your site with ads.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
				' Google Analytics support,' +
				' and the ability to monetize your site with ads.'
		),
	getPlanCompareFeatures: ( _, { isLoggedInMonthlyPricing } = {} ) =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			FEATURE_HOSTING,
			FEATURE_JETPACK_ESSENTIAL,
			! isLoggedInMonthlyPricing && FEATURE_EMAIL_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_13GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
		] ),
	getPromotedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_DESIGN,
		FEATURE_13GB_STORAGE,
	],
	getSignupFeatures: () => [
		FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		FEATURE_ADVANCED_CUSTOMIZATION,
		FEATURE_ALL_PERSONAL_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_MONETISE,
		FEATURE_PREMIUM_THEMES,
		FEATURE_ALL_PERSONAL_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_ADVANCED_CUSTOMIZATION,
		FEATURE_PREMIUM_THEMES,
		FEATURE_ALL_PERSONAL_FEATURES,
	],
	getSignupCompareAvailableFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_HOSTING,
		FEATURE_NO_ADS,
		FEATURE_COLLECT_PAYMENTS_V2,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		FEATURE_EARN_AD,
		FEATURE_PREMIUM_THEMES,
		FEATURE_GOOGLE_ANALYTICS,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS, FEATURE_CLOUDFLARE_ANALYTICS ],
	getInferiorHiddenFeatures: () => [],
} );

const getPlanBusinessDetails = () => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_BUSINESS,
	getTitle: () => i18n.translate( 'Business' ),
	getAudience: () => i18n.translate( 'Best for small businesses' ),
	getBlogAudience: () => i18n.translate( 'Best for small businesses' ),
	getPortfolioAudience: () => i18n.translate( 'Best for small businesses' ),
	getStoreAudience: () => i18n.translate( 'The plan for small businesses' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for small businesses:{{/strong}} Power your' +
				' business website with custom plugins and themes, unlimited premium and business theme templates,' +
				' 200 GB storage, and the ability to remove WordPress.com branding.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Power your business website with custom plugins and themes, unlimited premium and business theme templates,' +
				' 200 GB storage, and the ability to remove WordPress.com branding.'
		),
	getTagline: () =>
		i18n.translate(
			'Learn more about everything included with Business and take advantage of its professional features.'
		),
	getPlanCompareFeatures: ( _, { isLoggedInMonthlyPricing } = {} ) =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			FEATURE_HOSTING,
			FEATURE_JETPACK_ADVANCED,
			! isLoggedInMonthlyPricing && FEATURE_EMAIL_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_200GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_BUSINESS_ONBOARDING,
			FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_PLUGINS,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_THEMES,
			FEATURE_NO_BRANDING,
		] ),
	getPromotedFeatures: () => [
		FEATURE_200GB_STORAGE,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_DESIGN,
		FEATURE_VIDEO_UPLOADS,
		FEATURE_BUSINESS_ONBOARDING,
	],
	getSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_ADVANCED_SEO_TOOLS,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_ADVANCED_SEO_TOOLS,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_200GB_STORAGE,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	getSignupCompareAvailableFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_HOSTING,
		FEATURE_NO_ADS,
		FEATURE_COLLECT_PAYMENTS_V2,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
		FEATURE_EARN_AD,
		FEATURE_PREMIUM_THEMES,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_INSTALL_PLUGINS,
		FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		FEATURE_SITE_BACKUPS_AND_RESTORE,
		FEATURE_SFTP_DATABASE,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [
		FEATURE_AUDIO_UPLOADS,
		FEATURE_GOOGLE_MY_BUSINESS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
		FEATURE_SEO_PREVIEW_TOOLS,
	],
	getInferiorHiddenFeatures: () => [],
} );

const getJetpackPersonalDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_PERSONAL,
	getTitle: () => i18n.translate( 'Personal' ),
	availableFor: ( plan ) => [ PLAN_JETPACK_FREE ].includes( plan ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for personal use:{{/strong}} Security essentials for your WordPress site, including ' +
				'automated backups and priority support.',
			plansDescriptionHeadingComponent
		),
	getTagline: () =>
		i18n.translate(
			'Your data is being securely backed up and you have access to priority support.'
		),
	getPlanCardFeatures: () => [ FEATURE_BACKUP_DAILY_V2, FEATURE_ANTISPAM_V2 ],
	getBillingTimeFrame: () => i18n.translate( 'per year' ),
	getHiddenFeatures: () => [
		FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		FEATURE_BACKUP_ARCHIVE_30,
		FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		FEATURE_AUTOMATED_RESTORES,
		FEATURE_SPAM_AKISMET_PLUS,
		FEATURE_EASY_SITE_MIGRATION,
		FEATURE_PREMIUM_SUPPORT,
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_JETPACK_ANTI_SPAM,
		FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_ADVANCED_SEO,
		FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		FEATURE_SPAM_AKISMET_PLUS,
		FEATURE_ACTIVITY_LOG,
		FEATURE_PREMIUM_SUPPORT,
		FEATURE_ALL_FREE_FEATURES_JETPACK,
	],
} );

const getJetpackPremiumDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_PREMIUM,
	availableFor: ( plan ) =>
		[ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ].includes( plan ),
	getTitle: () => i18n.translate( 'Premium' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for small businesses:{{/strong}} Comprehensive, automated scanning for security vulnerabilities, ' +
				'fast video hosting, and marketing automation.',
			plansDescriptionHeadingComponent
		),
	getTagline: () =>
		i18n.translate(
			'Your site is being secured and you have access to marketing tools and priority support.'
		),
	getPlanCardFeatures: () => [ FEATURE_BACKUP_DAILY_V2, FEATURE_SCAN_V2, FEATURE_ANTISPAM_V2 ],
	getHiddenFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
			FEATURE_MALWARE_SCANNING_DAILY,
			FEATURE_ADVANCED_SEO,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_JETPACK_BACKUP_DAILY,
			FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
			FEATURE_JETPACK_SCAN_DAILY,
			FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
			FEATURE_JETPACK_ANTI_SPAM,
			FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_MALWARE_SCANNING_DAILY,
			FEATURE_AUTOMATIC_SECURITY_FIXES,
			FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
			FEATURE_WORDADS_INSTANT,
			FEATURE_ADVANCED_SEO,
			FEATURE_ALL_FREE_FEATURES_JETPACK,
		] ),
} );

const getJetpackBusinessDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_BUSINESS,
	getTitle: () => i18n.translate( 'Professional' ),
	availableFor: ( plan ) =>
		[
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY,
		].includes( plan ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for organizations:{{/strong}} The most powerful WordPress sites: real-time backups ' +
				'and unlimited premium themes.',
			plansDescriptionHeadingComponent
		),
	getTagline: () => i18n.translate( 'You have the full suite of security and performance tools.' ),
	getPlanCardFeatures: () => [
		FEATURE_BACKUP_REALTIME_V2,
		FEATURE_PRODUCT_SCAN_REALTIME_V2,
		FEATURE_ANTISPAM_V2,
	],
	getHiddenFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
			FEATURE_BACKUP_ARCHIVE_UNLIMITED,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
			FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
			FEATURE_ONE_CLICK_THREAT_RESOLUTION,
			FEATURE_ADVANCED_SEO,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_JETPACK_BACKUP_REALTIME,
			FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
			FEATURE_JETPACK_SCAN_DAILY,
			FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
			FEATURE_JETPACK_ANTI_SPAM,
			FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		] ),
	getInferiorHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	],
} );

const getPlanJetpackSecurityDailyDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_SECURITY_DAILY,
	getTitle: () => translate( 'Security {{em}}Daily{{/em}}', { components: { em: <em /> } } ),
	availableFor: ( plan ) => [ PLAN_JETPACK_FREE, ...JETPACK_LEGACY_PLANS ].includes( plan ),
	getDescription: () =>
		translate(
			'All of the essential Jetpack Security features in one package including Backup, Scan, Anti-spam and more.'
		),
	getTagline: () => translate( 'Best for sites with occasional updates' ),
	getPlanCardFeatures: () => [
		FEATURE_PRODUCT_BACKUP_DAILY_V2,
		FEATURE_PRODUCT_SCAN_DAILY_V2,
		FEATURE_ANTISPAM_V2,
		FEATURE_VIDEO_HOSTING_V2,
	],
	getHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_JETPACK_SCAN_DAILY,
		FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		FEATURE_JETPACK_ANTI_SPAM,
		FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
		FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		FEATURE_REPUBLICIZE,
		FEATURE_ADVANCED_SEO,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_SIMPLE_PAYMENTS,
		FEATURE_WORDADS_INSTANT,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_PREMIUM_SUPPORT,
	],
} );

const getPlanJetpackSecurityRealtimeDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_SECURITY_REALTIME,
	getTitle: () =>
		translate( 'Security {{em}}Real-time{{/em}}', {
			components: { em: <em style={ { whiteSpace: 'nowrap' } } /> },
		} ),
	availableFor: ( plan ) =>
		[
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_SECURITY_DAILY,
			PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
			...JETPACK_LEGACY_PLANS,
		].includes( plan ),
	getDescription: () =>
		translate(
			'Get next-level protection with real-time backups, real-time scan and all essential security tools.'
		),
	getTagline: () => translate( 'Best for sites with frequent updates' ),
	getPlanCardFeatures: () => [
		FEATURE_PLAN_SECURITY_DAILY,
		FEATURE_PRODUCT_BACKUP_REALTIME_V2,
		FEATURE_PRODUCT_SCAN_REALTIME_V2,
		FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	],
	getHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_REALTIME,
		FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
		FEATURE_JETPACK_SCAN_DAILY,
		FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		FEATURE_JETPACK_ANTI_SPAM,
		FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		FEATURE_REPUBLICIZE,
		FEATURE_ADVANCED_SEO,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_SIMPLE_PAYMENTS,
		FEATURE_WORDADS_INSTANT,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_PREMIUM_SUPPORT,
	],
	getInferiorHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
	],
} );

const getPlanJetpackCompleteDetails = () => ( {
	group: GROUP_JETPACK,
	type: TYPE_ALL,
	getTitle: () =>
		translate( 'Complete', {
			context: 'Jetpack plan name',
		} ),
	availableFor: ( plan ) =>
		[ PLAN_JETPACK_FREE, ...JETPACK_SECURITY_PLANS, ...JETPACK_LEGACY_PLANS ].includes( plan ),
	getDescription: () =>
		translate(
			'Get the full Jetpack suite with real-time security, enhanced search, CRM, marketing, growth, and design tools.'
		),
	getTagline: () => translate( 'For best-in-class WordPress sites' ),
	getPlanCardFeatures: () => [
		FEATURE_PLAN_SECURITY_DAILY,
		FEATURE_BACKUP_REALTIME_V2,
		FEATURE_PRODUCT_SCAN_REALTIME_V2,
		FEATURE_CRM_V2,
		FEATURE_PRODUCT_SEARCH_V2,
	],
	getHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_REALTIME,
		FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
		FEATURE_JETPACK_SCAN_DAILY,
		FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		FEATURE_JETPACK_ANTI_SPAM,
		FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
		FEATURE_JETPACK_SEARCH,
		FEATURE_JETPACK_SEARCH_MONTHLY,
		FEATURE_JETPACK_CRM,
		FEATURE_JETPACK_CRM_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		FEATURE_REPUBLICIZE,
		FEATURE_ADVANCED_SEO,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_SIMPLE_PAYMENTS,
		FEATURE_WORDADS_INSTANT,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_PREMIUM_SUPPORT,
	],
	getInferiorHiddenFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
	],
} );

// DO NOT import. Use `getPlan` instead.
export const PLANS_LIST = {
	[ PLAN_FREE ]: {
		group: GROUP_WPCOM,
		type: TYPE_FREE,
		term: TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Free' ),
		getAudience: () => i18n.translate( 'Best for students' ),
		getBlogAudience: () => i18n.translate( 'Best for students' ),
		getPortfolioAudience: () => i18n.translate( 'Best for students' ),
		getStoreAudience: () => i18n.translate( 'Best for students' ),
		getProductId: () => 1,
		getStoreSlug: () => PLAN_FREE,
		getPathSlug: () => 'beginner',
		getDescription: () =>
			i18n.translate(
				'Get a free website and be on your way to publishing your ' +
					'first post in less than five minutes.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_WP_SUBDOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_COMMUNITY_SUPPORT,
			FEATURE_FREE_THEMES,
			FEATURE_BASIC_DESIGN,
			FEATURE_3GB_STORAGE,
		],
		getSignupFeatures: () => [
			FEATURE_COMMUNITY_SUPPORT,
			FEATURE_WP_SUBDOMAIN_SIGNUP,
			FEATURE_FREE_THEMES_SIGNUP,
		],
		getBlogSignupFeatures: () => [
			FEATURE_COMMUNITY_SUPPORT,
			FEATURE_WP_SUBDOMAIN_SIGNUP,
			FEATURE_FREE_THEMES_SIGNUP,
		],
		getPortfolioSignupFeatures: () => [
			FEATURE_COMMUNITY_SUPPORT,
			FEATURE_WP_SUBDOMAIN_SIGNUP,
			FEATURE_FREE_THEMES_SIGNUP,
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' ),
		getHiddenFeatures: () => [],
		getInferiorHiddenFeatures: () => [],
	},

	[ PLAN_BLOGGER ]: {
		...getPlanBloggerDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: ( plan ) => [ PLAN_FREE ].includes( plan ),
		getProductId: () => 1010,
		getStoreSlug: () => PLAN_BLOGGER,
		getPathSlug: () => 'blogger',
	},

	[ PLAN_BLOGGER_2_YEARS ]: {
		...getPlanBloggerDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: ( plan ) => [ PLAN_FREE, PLAN_BLOGGER ].includes( plan ),
		getProductId: () => 1030,
		getStoreSlug: () => PLAN_BLOGGER_2_YEARS,
		getPathSlug: () => 'blogger-2-years',
	},

	[ PLAN_PERSONAL_MONTHLY ]: {
		...getPlanPersonalDetails(),
		...getMonthlyTimeframe(),
		availableFor: ( plan ) => [ PLAN_FREE, PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS ].includes( plan ),
		getProductId: () => 1019,
		getStoreSlug: () => PLAN_PERSONAL_MONTHLY,
		getPathSlug: () => 'personal-monthly',
	},

	[ PLAN_PERSONAL ]: {
		...getPlanPersonalDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: ( plan ) =>
			[ PLAN_FREE, PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL_MONTHLY ].includes( plan ),
		getProductId: () => 1009,
		getStoreSlug: () => PLAN_PERSONAL,
		getPathSlug: () => 'personal',
	},

	[ PLAN_PERSONAL_2_YEARS ]: {
		...getPlanPersonalDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
			].includes( plan ),
		getProductId: () => 1029,
		getStoreSlug: () => PLAN_PERSONAL_2_YEARS,
		getPathSlug: () => 'personal-2-years',
	},

	[ PLAN_PREMIUM_MONTHLY ]: {
		...getPlanPremiumDetails(),
		...getMonthlyTimeframe(),
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
			].includes( plan ),
		getProductId: () => 1013,
		getStoreSlug: () => PLAN_PREMIUM_MONTHLY,
		getPathSlug: () => 'premium-monthly',
	},

	[ PLAN_PREMIUM ]: {
		...getPlanPremiumDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
			].includes( plan ),
		getProductId: () => 1003,
		getStoreSlug: () => PLAN_PREMIUM,
		getPathSlug: () => 'premium',
	},

	[ PLAN_PREMIUM_2_YEARS ]: {
		...getPlanPremiumDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
			].includes( plan ),
		getProductId: () => 1023,
		getStoreSlug: () => PLAN_PREMIUM_2_YEARS,
		getPathSlug: () => 'premium-2-years',
	},

	[ PLAN_BUSINESS_MONTHLY ]: {
		...getPlanBusinessDetails(),
		...getMonthlyTimeframe(),
		availableFor: ( plan ) =>
			isEnabled( 'upgrades/wpcom-monthly-plans' ) &&
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
			].includes( plan ),
		getProductId: () => 1018,
		getStoreSlug: () => PLAN_BUSINESS_MONTHLY,
		getPathSlug: () => 'business-monthly',
	},

	[ PLAN_BUSINESS ]: {
		...getPlanBusinessDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS_MONTHLY,
			].includes( plan ),
		getProductId: () => 1008,
		getStoreSlug: () => PLAN_BUSINESS,
		getPathSlug: () => 'business',
	},

	[ PLAN_BUSINESS_2_YEARS ]: {
		...getPlanBusinessDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS,
				PLAN_BUSINESS_MONTHLY,
			].includes( plan ),
		getProductId: () => 1028,
		getStoreSlug: () => PLAN_BUSINESS_2_YEARS,
		getPathSlug: () => 'business-2-years',
	},

	[ PLAN_ECOMMERCE_MONTHLY ]: {
		...getPlanEcommerceDetails(),
		...getMonthlyTimeframe(),
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS_MONTHLY,
				PLAN_BUSINESS,
				PLAN_BUSINESS_2_YEARS,
			].includes( plan ),
		getProductId: () => 1021,
		getStoreSlug: () => PLAN_ECOMMERCE_MONTHLY,
		getPathSlug: () => 'ecommerce-monthly',
	},

	[ PLAN_ECOMMERCE ]: {
		...getPlanEcommerceDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS_MONTHLY,
				PLAN_BUSINESS,
				PLAN_BUSINESS_2_YEARS,
				PLAN_ECOMMERCE_MONTHLY,
			].includes( plan ),
		getProductId: () => 1011,
		getStoreSlug: () => PLAN_ECOMMERCE,
		getPathSlug: () => 'ecommerce',
	},

	[ PLAN_ECOMMERCE_2_YEARS ]: {
		...getPlanEcommerceDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: ( plan ) =>
			[
				PLAN_FREE,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS_MONTHLY,
				PLAN_BUSINESS,
				PLAN_BUSINESS_2_YEARS,
				PLAN_ECOMMERCE_MONTHLY,
				PLAN_ECOMMERCE,
			].includes( plan ),
		getProductId: () => 1031,
		getStoreSlug: () => PLAN_ECOMMERCE_2_YEARS,
		getPathSlug: () => 'ecommerce-2-years',
	},

	[ PLAN_JETPACK_FREE ]: {
		term: TERM_ANNUALLY,
		group: GROUP_JETPACK,
		type: TYPE_FREE,
		getTitle: () => i18n.translate( 'Free' ),
		getProductId: () => 2002,
		getStoreSlug: () => PLAN_JETPACK_FREE,
		getTagline: ( siteFeatures = [] ) => {
			const hasSiteJetpackBackup = siteFeatures.some( ( feature ) =>
				[
					FEATURE_JETPACK_BACKUP_DAILY,
					FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
					FEATURE_JETPACK_BACKUP_REALTIME,
					FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
				].includes( feature )
			);
			const hasSiteJetpackScan = siteFeatures.some( ( feature ) =>
				[ FEATURE_JETPACK_SCAN_DAILY, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ].includes( feature )
			);
			if ( hasSiteJetpackBackup && hasSiteJetpackScan ) {
				return i18n.translate(
					'Upgrade your site to access additional features, including spam protection and priority support.'
				);
			} else if ( hasSiteJetpackBackup ) {
				return i18n.translate(
					'Upgrade your site to access additional features, including spam protection, security scanning, and priority support.'
				);
			} else if ( hasSiteJetpackScan ) {
				return i18n.translate(
					'Upgrade your site to access additional features, including spam protection, backups, and priority support.'
				);
			}
			return i18n.translate(
				'Upgrade your site for additional features, including spam protection, backups, security scanning, and priority support.'
			);
		},
		getDescription: () =>
			i18n.translate(
				'The features most needed by WordPress sites' +
					' — perfectly packaged and optimized for everyone.'
			),
		getBillingTimeFrame: () => i18n.translate( 'for life' ),
		getHiddenFeatures: () => [
			FEATURE_STANDARD_SECURITY_TOOLS,
			FEATURE_SITE_STATS,
			FEATURE_TRAFFIC_TOOLS,
			FEATURE_MANAGE,
			FEATURE_ADVANCED_SEO,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_FREE_WORDPRESS_THEMES,
			FEATURE_SITE_STATS,
			FEATURE_STANDARD_SECURITY_TOOLS,
			FEATURE_TRAFFIC_TOOLS,
			FEATURE_BLANK,
		],
	},

	[ PLAN_JETPACK_PREMIUM ]: {
		...getJetpackPremiumDetails(),
		...getAnnualTimeframe(),
		getProductId: () => 2000,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM,
		getPathSlug: () => 'premium',
	},

	[ PLAN_JETPACK_PREMIUM_MONTHLY ]: {
		...getJetpackPremiumDetails(),
		...getMonthlyTimeframe(),
		getProductId: () => 2003,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM_MONTHLY,
		getPathSlug: () => 'premium-monthly',
	},

	[ PLAN_JETPACK_PERSONAL ]: {
		...getJetpackPersonalDetails(),
		...getAnnualTimeframe(),
		getProductId: () => 2005,
		getStoreSlug: () => PLAN_JETPACK_PERSONAL,
		getPathSlug: () => 'jetpack-personal',
	},

	[ PLAN_JETPACK_PERSONAL_MONTHLY ]: {
		...getJetpackPersonalDetails(),
		...getMonthlyTimeframe(),
		getProductId: () => 2006,
		getStoreSlug: () => PLAN_JETPACK_PERSONAL_MONTHLY,
		getPathSlug: () => 'jetpack-personal-monthly',
	},

	[ PLAN_JETPACK_BUSINESS ]: {
		...getJetpackBusinessDetails(),
		...getAnnualTimeframe(),
		getProductId: () => 2001,
		getStoreSlug: () => PLAN_JETPACK_BUSINESS,
		getPathSlug: () => 'professional',
	},

	[ PLAN_JETPACK_BUSINESS_MONTHLY ]: {
		...getJetpackBusinessDetails(),
		...getMonthlyTimeframe(),
		getProductId: () => 2004,
		getStoreSlug: () => PLAN_JETPACK_BUSINESS_MONTHLY,
		getPathSlug: () => 'professional-monthly',
	},

	[ PLAN_JETPACK_SECURITY_DAILY ]: {
		...getPlanJetpackSecurityDailyDetails(),
		...getAnnualTimeframe(),
		getMonthlySlug: () => PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
		getStoreSlug: () => PLAN_JETPACK_SECURITY_DAILY,
		getPathSlug: () => 'security-daily',
		getProductId: () => 2010,
	},

	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: {
		...getPlanJetpackSecurityDailyDetails(),
		...getMonthlyTimeframe(),
		getAnnualSlug: () => PLAN_JETPACK_SECURITY_DAILY,
		getStoreSlug: () => PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
		getPathSlug: () => 'security-daily-monthly',
		getProductId: () => 2011,
	},

	[ PLAN_JETPACK_SECURITY_REALTIME ]: {
		...getPlanJetpackSecurityRealtimeDetails(),
		...getAnnualTimeframe(),
		getMonthlySlug: () => PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		getStoreSlug: () => PLAN_JETPACK_SECURITY_REALTIME,
		getPathSlug: () => 'security-realtime',
		getProductId: () => 2012,
	},

	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: {
		...getPlanJetpackSecurityRealtimeDetails(),
		...getMonthlyTimeframe(),
		getAnnualSlug: () => PLAN_JETPACK_SECURITY_REALTIME,
		getStoreSlug: () => PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
		getPathSlug: () => 'security-realtime-monthly',
		getProductId: () => 2013,
	},

	[ PLAN_JETPACK_COMPLETE ]: {
		...getPlanJetpackCompleteDetails(),
		...getAnnualTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_COMPLETE,
		getPathSlug: () => 'complete',
		getProductId: () => 2014,
	},

	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: {
		...getPlanJetpackCompleteDetails(),
		...getMonthlyTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_COMPLETE_MONTHLY,
		getPathSlug: () => 'complete-monthly',
		getProductId: () => 2015,
	},

	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_SECURITY_T1,
		...getAnnualTimeframe(),
	},

	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_SECURITY_T1,
		...getMonthlyTimeframe(),
	},

	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_SECURITY_T2,
		...getAnnualTimeframe(),
	},

	[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_SECURITY_T2,
		...getMonthlyTimeframe(),
	},

	[ PLAN_P2_PLUS ]: {
		group: GROUP_WPCOM,
		type: TYPE_P2_PLUS,
		getTitle: () => i18n.translate( 'P2+' ),
		getDescription: () =>
			i18n.translate(
				'{{strong}}Best for professionals:{{/strong}} Enhance your P2 with more space for audio and video, advanced search, an activity overview panel, and priority customer support.',
				plansDescriptionHeadingComponent
			),
		getShortDescription: () => i18n.translate( 'Some short description' ),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_P2_13GB_STORAGE,
			FEATURE_P2_ADVANCED_SEARCH,
			FEATURE_P2_VIDEO_SHARING,
			FEATURE_P2_MORE_FILE_TYPES,
			FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
			FEATURE_P2_ACTIVITY_OVERVIEW,
		],

		// TODO: update this once we put P2+ in the signup.
		getSignupFeatures: () => [ FEATURE_EMAIL_SUPPORT_SIGNUP ],

		// TODO: no idea about this, copied from the WP.com Premium plan.
		// Features not displayed but used for checking plan abilities
		getHiddenFeatures: () => [
			FEATURE_AUDIO_UPLOADS,
			FEATURE_JETPACK_SEARCH,
			FEATURE_JETPACK_SEARCH_MONTHLY,
		],
		getInferiorHiddenFeatures: () => [],

		// TODO: Calypso requires this prop but we probably don't need it. Refactor Calypso?
		getAudience: () => i18n.translate( 'Best for bloggers' ),

		...getMonthlyTimeframe(),
		availableFor: ( plan ) => [ PLAN_FREE ].includes( plan ), //TODO: only for P2 sites.
		getProductId: () => 1040,
		getStoreSlug: () => PLAN_P2_PLUS,
		getPathSlug: () => 'p2-plus',
		getBillingTimeFrame: () => translate( 'per user per month' ),
	},
};

PLANS_LIST[ PLAN_P2_FREE ] = {
	...PLANS_LIST[ PLAN_FREE ],
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for small groups:{{/strong}} All the features needed to share, discuss, review, and collaborate with your team in one spot, without interruptions.',
			plansDescriptionHeadingComponent
		),
	getTitle: () => i18n.translate( 'P2 Free' ),
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		FEATURE_P2_3GB_STORAGE,
		FEATURE_P2_UNLIMITED_USERS,
		FEATURE_P2_UNLIMITED_POSTS_PAGES,
		FEATURE_P2_SIMPLE_SEARCH,
		FEATURE_P2_CUSTOMIZATION_OPTIONS,
	],
};
