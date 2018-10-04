/** @format */

/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';
import { compact, includes } from 'lodash';

/**
 * Internal dependencies
 */

import { isEnabled } from 'config';
import { isBusinessPlan, isFreePlan, isBloggerPlan, isPersonalPlan, isPremiumPlan } from './index';

// plans constants
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_BLOGGER = 'blogger-bundle';
export const PLAN_BLOGGER_2_YEARS = 'blogger-bundle-2y';
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

export const POPULAR_PLANS = [ PLAN_PREMIUM ];
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
export const FEATURE_FREE_THEMES = 'free-themes';
export const FEATURE_UNLIMITED_PREMIUM_THEMES = 'premium-themes';
export const FEATURE_3GB_STORAGE = '3gb-storage';
export const FEATURE_6GB_STORAGE = '6gb-storage';
export const FEATURE_13GB_STORAGE = '13gb-storage';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_COMMUNITY_SUPPORT = 'community-support';
export const FEATURE_EMAIL_SUPPORT = 'email-support';
export const FEATURE_EMAIL_LIVE_CHAT_SUPPORT = 'email-live-chat-support';
export const FEATURE_PREMIUM_SUPPORT = 'priority-support';
export const FEATURE_BASIC_DESIGN = 'basic-design';
export const FEATURE_ADVANCED_DESIGN = 'advanced-design';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
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

const WPComGetBillingTimeframe = () =>
	i18n.translate( '/month, billed annually or every two years' );
const WPComGetBiennialBillingTimeframe = () => i18n.translate( '/month, billed every two years' );

const getPlanBloggerDetails = () => ( {
	group: GROUP_WPCOM,
	type: TYPE_BLOGGER,
	getTitle: () => i18n.translate( 'Blogger' ),
	// @TODO not updating copy for now, we need to update it after the first round of design {{{
	getAudience: () => i18n.translate( 'Best for hobbyists' ),
	getBlogAudience: () => i18n.translate( 'Best for hobbyists' ),
	getPortfolioAudience: () => i18n.translate( 'Best for hobbyists' ),
	getStoreAudience: () => i18n.translate( 'Best for hobbyists' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Personal Use:{{/strong}} Boost your' +
				' website with a custom domain name, and remove all WordPress.com advertising. ' +
				'Get access to high-quality email and live chat support.',
			{
				components: {
					strong: (
						<strong className="plans__features plan-features__targeted-description-heading" />
					),
				},
			}
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
	],
	getSignupFeatures: () => [
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_FREE_DOMAIN,
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
} );

const getPlanPersonalDetails = () => ( {
	group: GROUP_WPCOM,
	type: TYPE_PERSONAL,
	getTitle: () => i18n.translate( 'Personal' ),
	getAudience: () => i18n.translate( 'Best for hobbyists' ),
	getBlogAudience: () => i18n.translate( 'Best for hobbyists' ),
	getPortfolioAudience: () => i18n.translate( 'Best for hobbyists' ),
	getStoreAudience: () => i18n.translate( 'Best for hobbyists' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Personal Use:{{/strong}} Boost your' +
				' website with a custom domain name, and remove all WordPress.com advertising. ' +
				'Get access to high-quality email and live chat support.',
			{
				components: {
					strong: (
						<strong className="plans__features plan-features__targeted-description-heading" />
					),
				},
			}
		),
	getPlanCompareFeatures: () => [
		// pay attention to ordering, shared features should align on /plan page
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_JETPACK_ESSENTIAL,
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		FEATURE_FREE_THEMES,
		FEATURE_BASIC_DESIGN,
		FEATURE_6GB_STORAGE,
		FEATURE_NO_ADS,
	],
	getSignupFeatures: () => [
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		FEATURE_FREE_DOMAIN,
		FEATURE_ALL_FREE_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_FREE_DOMAIN,
		FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		FEATURE_ALL_FREE_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
} );

const getPlanPremiumDetails = () => ( {
	group: GROUP_WPCOM,
	type: TYPE_PREMIUM,
	getTitle: () => i18n.translate( 'Premium' ),
	getAudience: () => i18n.translate( 'Best for entrepreneurs' ),
	getBlogAudience: () => i18n.translate( 'Best for professionals' ),
	getPortfolioAudience: () => i18n.translate( 'Best for freelancers' ),
	getStoreAudience: () => i18n.translate( 'Best for freelancers' ),
	getDescription: () =>
		i18n.translate(
			'{{strong}}Best for Entrepreneurs & Freelancers:{{/strong}}' +
				' Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
				' and the ability to monetize your site with ads.',
			{
				components: {
					strong: (
						<strong className="plans__features plan-features__targeted-description-heading" />
					),
				},
			}
		),
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_13GB_STORAGE,
			FEATURE_NO_ADS,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
		] ),
	getPromotedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_DESIGN,
		FEATURE_13GB_STORAGE,
	],
	getSignupFeatures: () =>
		compact( [
			FEATURE_ADVANCED_CUSTOMIZATION,
			FEATURE_PREMIUM_THEMES,
			FEATURE_ALL_PERSONAL_FEATURES,
		] ),
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
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
} );

const getPlanBusinessDetails = () => ( {
	group: GROUP_WPCOM,
	type: TYPE_BUSINESS,
	getTitle: () => i18n.translate( 'Business' ),
	getAudience: () => i18n.translate( 'Best for small businesses' ),
	getBlogAudience: () => i18n.translate( 'Best for brands' ),
	getPortfolioAudience: () => i18n.translate( 'Best for small businesses' ),
	getStoreAudience: () => i18n.translate( 'The plan for stores and small businesses' ),
	getDescription: abtest => {
		if ( abtest && abtest( 'businessPlanDescriptionAT' ) === 'pluginsAndThemes' ) {
			return i18n.translate(
				'{{strong}}Best for Small Business:{{/strong}} Power your' +
					' business website with custom plugins and themes, unlimited premium and business theme templates,' +
					' Google Analytics support, unlimited' +
					' storage, and the ability to remove WordPress.com branding.',
				{
					components: {
						strong: (
							<strong className="plans__features plan-features__targeted-description-heading" />
						),
					},
				}
			);
		}
		return i18n.translate(
			'{{strong}}Best for Small Business:{{/strong}} Power your' +
				' business website with unlimited premium and business theme templates, Google Analytics support, unlimited' +
				' storage, and the ability to remove WordPress.com branding.',
			{
				components: {
					strong: (
						<strong className="plans__features plan-features__targeted-description-heading" />
					),
				},
			}
		);
	},
	getTagline: () =>
		i18n.translate(
			'Learn more about everything included with Business and take advantage of its professional features.'
		),
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_UNLIMITED_STORAGE,
			FEATURE_NO_ADS,
			isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_BUSINESS_ONBOARDING,
			FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_PLUGINS,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_THEMES,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_NO_BRANDING,
		] ),
	getPromotedFeatures: () => [
		FEATURE_UNLIMITED_STORAGE,
		FEATURE_UNLIMITED_PREMIUM_THEMES,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_DESIGN,
		FEATURE_VIDEO_UPLOADS,
		FEATURE_BUSINESS_ONBOARDING,
	],
	getSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_GOOGLE_ANALYTICS_SIGNUP,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	getBlogSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_ADVANCED_SEO_TOOLS,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	getPortfolioSignupFeatures: () => [
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_UNLIMITED_STORAGE_SIGNUP,
		FEATURE_ALL_PREMIUM_FEATURES,
	],
	// Features not displayed but used for checking plan abilities
	getHiddenFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
} );

// DO NOT import. Use `getPlan` from `lib/plans` instead.
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
	},

	[ PLAN_BLOGGER ]: {
		...getPlanBloggerDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan => includes( [ PLAN_FREE ], plan ),
		getProductId: () => 1010,
		getStoreSlug: () => PLAN_BLOGGER,
		getPathSlug: () => 'blogger',
	},

	[ PLAN_BLOGGER_2_YEARS ]: {
		...getPlanBloggerDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan => includes( [ PLAN_FREE, PLAN_BLOGGER ], plan ),
		getProductId: () => 1030,
		getStoreSlug: () => PLAN_BLOGGER_2_YEARS,
		getPathSlug: () => 'blogger-2-years',
	},

	[ PLAN_PERSONAL ]: {
		...getPlanPersonalDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan => includes( [ PLAN_FREE, PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS ], plan ),
		getProductId: () => 1009,
		getStoreSlug: () => PLAN_PERSONAL,
		getPathSlug: () => 'personal',
	},

	[ PLAN_PERSONAL_2_YEARS ]: {
		...getPlanPersonalDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes( [ PLAN_FREE, PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL ], plan ),
		getProductId: () => 1029,
		getStoreSlug: () => PLAN_PERSONAL_2_YEARS,
		getPathSlug: () => 'personal-2-years',
	},

	[ PLAN_PREMIUM ]: {
		...getPlanPremiumDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[ PLAN_FREE, PLAN_BLOGGER, PLAN_BLOGGER_2_YEARS, PLAN_PERSONAL, PLAN_PERSONAL_2_YEARS ],
				plan
			),
		getProductId: () => 1003,
		getStoreSlug: () => PLAN_PREMIUM,
		getPathSlug: () => 'premium',
	},

	[ PLAN_PREMIUM_2_YEARS ]: {
		...getPlanPremiumDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					PLAN_FREE,
					PLAN_BLOGGER,
					PLAN_BLOGGER_2_YEARS,
					PLAN_PERSONAL,
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM,
				],
				plan
			),
		getProductId: () => 1023,
		getStoreSlug: () => PLAN_PREMIUM_2_YEARS,
		getPathSlug: () => 'premium-2-years',
	},

	[ PLAN_BUSINESS ]: {
		...getPlanBusinessDetails(),
		term: TERM_ANNUALLY,
		getBillingTimeFrame: WPComGetBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					PLAN_FREE,
					PLAN_BLOGGER,
					PLAN_BLOGGER_2_YEARS,
					PLAN_PERSONAL,
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM,
					PLAN_PREMIUM_2_YEARS,
				],
				plan
			),
		getProductId: () => 1008,
		getStoreSlug: () => PLAN_BUSINESS,
		getPathSlug: () => 'business',
	},

	[ PLAN_BUSINESS_2_YEARS ]: {
		...getPlanBusinessDetails(),
		term: TERM_BIENNIALLY,
		getBillingTimeFrame: WPComGetBiennialBillingTimeframe,
		availableFor: plan =>
			includes(
				[
					PLAN_FREE,
					PLAN_BLOGGER,
					PLAN_BLOGGER_2_YEARS,
					PLAN_PERSONAL,
					PLAN_PERSONAL_2_YEARS,
					PLAN_PREMIUM,
					PLAN_PREMIUM_2_YEARS,
					PLAN_BUSINESS,
				],
				plan
			),
		getProductId: () => 1028,
		getStoreSlug: () => PLAN_BUSINESS_2_YEARS,
		getPathSlug: () => 'business-2-years',
	},

	[ PLAN_JETPACK_FREE ]: {
		term: TERM_ANNUALLY,
		group: GROUP_JETPACK,
		type: TYPE_FREE,
		getTitle: () => i18n.translate( 'Free' ),
		getAudience: () => i18n.translate( 'Best for students' ),
		getProductId: () => 2002,
		getStoreSlug: () => PLAN_JETPACK_FREE,
		getTagline: () =>
			i18n.translate(
				'Upgrade your site to access additional features, including spam protection, backups, and priority support.'
			),
		getDescription: () =>
			i18n.translate(
				'The features most needed by WordPress sites' +
					' — perfectly packaged and optimized for everyone.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_STANDARD_SECURITY_TOOLS,
			FEATURE_SITE_STATS,
			FEATURE_TRAFFIC_TOOLS,
			FEATURE_MANAGE,
		],
		getSignupFeatures: () => [
			FEATURE_FREE_WORDPRESS_THEMES,
			FEATURE_SITE_STATS,
			FEATURE_STANDARD_SECURITY_TOOLS,
			FEATURE_TRAFFIC_TOOLS,
			FEATURE_BLANK,
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'for life' ),
	},

	[ PLAN_JETPACK_PREMIUM ]: {
		group: GROUP_JETPACK,
		type: TYPE_PREMIUM,
		term: TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Premium' ),
		getAudience: () => i18n.translate( 'Best for small businesses' ),
		getSubtitle: () => i18n.translate( 'Protection, speed, and revenue.' ),
		getProductId: () => 2000,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM,
		availableFor: plan =>
			includes(
				[
					PLAN_JETPACK_FREE,
					PLAN_JETPACK_PERSONAL,
					PLAN_JETPACK_PERSONAL_MONTHLY,
					PLAN_JETPACK_PREMIUM_MONTHLY,
				],
				plan
			),
		getPathSlug: () => 'premium',
		getDescription: () =>
			i18n.translate(
				'Comprehensive, automated scanning for security vulnerabilities, ' +
					'fast video hosting, and marketing automation.'
			),
		getTagline: () =>
			i18n.translate(
				'Your site is being secured and you have access to marketing tools and priority support.'
			),
		getPlanCompareFeatures: () =>
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
			] ),
		getSignupFeatures: () =>
			compact( [
				FEATURE_MALWARE_SCANNING_DAILY,
				FEATURE_MARKETING_AUTOMATION,
				FEATURE_WORDADS_INSTANT,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				FEATURE_ADVANCED_SEO,
				FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
	},

	[ PLAN_JETPACK_PREMIUM_MONTHLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_PREMIUM,
		term: TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Premium' ),
		getAudience: () => i18n.translate( 'Best for small businesses' ),
		getProductId: () => 2003,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM_MONTHLY,
		getPathSlug: () => 'premium-monthly',
		availableFor: plan =>
			includes( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ], plan ),
		getDescription: () =>
			i18n.translate(
				'Comprehensive, automated scanning for security vulnerabilities, ' +
					'fast video hosting, and marketing automation.'
			),
		getTagline: () =>
			i18n.translate(
				'Your site is being secured and you have access to marketing tools and priority support.'
			),
		getPlanCompareFeatures: () =>
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
			] ),
		getSignupFeatures: () =>
			compact( [
				FEATURE_MALWARE_SCANNING_DAILY,
				FEATURE_MARKETING_AUTOMATION,
				FEATURE_WORDADS_INSTANT,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				FEATURE_ADVANCED_SEO,
				FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
	},

	[ PLAN_JETPACK_PERSONAL ]: {
		group: GROUP_JETPACK,
		type: TYPE_PERSONAL,
		term: TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Personal' ),
		getAudience: () => i18n.translate( 'Best for hobbyists' ),
		getProductId: () => 2005,
		getStoreSlug: () => PLAN_JETPACK_PERSONAL,
		availableFor: plan => includes( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL_MONTHLY ], plan ),
		getPathSlug: () => 'jetpack-personal',
		getDescription: () =>
			i18n.translate(
				'Security essentials for your WordPress site, including ' +
					'automated backups and priority support.'
			),
		getTagline: () =>
			i18n.translate(
				'Your data is being securely backed up and you have access to priority support.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
		],
		getSignupFeatures: () => [
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_ALL_FREE_FEATURES_JETPACK,
		],
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
	},

	[ PLAN_JETPACK_PERSONAL_MONTHLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_PERSONAL,
		term: TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Personal' ),
		getAudience: () => i18n.translate( 'Best for hobbyists' ),
		getStoreSlug: () => PLAN_JETPACK_PERSONAL_MONTHLY,
		getProductId: () => 2006,
		getPathSlug: () => 'jetpack-personal-monthly',
		availableFor: plan => includes( [ PLAN_JETPACK_FREE ], plan ),
		getDescription: () =>
			i18n.translate(
				'Security essentials for your WordPress site, including ' +
					'automated backups and priority support.'
			),
		getTagline: () =>
			i18n.translate(
				'Your data is being securely backed up and you have access to priority support.'
			),
		getPlanCompareFeatures: () => [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
		],
		getSignupFeatures: () => [
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_ALL_FREE_FEATURES_JETPACK,
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
	},

	[ PLAN_JETPACK_BUSINESS ]: {
		group: GROUP_JETPACK,
		type: TYPE_BUSINESS,
		term: TERM_ANNUALLY,
		getTitle: () => i18n.translate( 'Professional' ),
		getAudience: () => i18n.translate( 'Best for organizations' ),
		getStoreSlug: () => PLAN_JETPACK_BUSINESS,
		getProductId: () => 2001,
		availableFor: plan =>
			includes(
				[
					PLAN_JETPACK_BUSINESS_MONTHLY,
					PLAN_JETPACK_FREE,
					PLAN_JETPACK_PREMIUM,
					PLAN_JETPACK_PREMIUM_MONTHLY,
					PLAN_JETPACK_PERSONAL,
					PLAN_JETPACK_PERSONAL_MONTHLY,
				],
				plan
			),
		getPathSlug: () => 'professional',
		getDescription: () =>
			i18n.translate(
				'The most powerful WordPress sites: unlimited premium ' +
					'themes, real-time backups, and enhanced search.'
			),
		getTagline: () =>
			i18n.translate(
				'You have full access to premium themes, marketing tools, and priority support.'
			),
		getPlanCompareFeatures: () =>
			compact( [
				// pay attention to ordering, shared features should align on /plan page
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				FEATURE_BACKUP_ARCHIVE_UNLIMITED,
				FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				FEATURE_AUTOMATED_RESTORES,
				FEATURE_SPAM_AKISMET_PLUS,
				FEATURE_EASY_SITE_MIGRATION,
				FEATURE_PREMIUM_SUPPORT,
				FEATURE_SEARCH,
				isEnabled( 'republicize' ) && FEATURE_REPUBLICIZE,
				FEATURE_SIMPLE_PAYMENTS,
				FEATURE_WORDADS_INSTANT,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
				FEATURE_ONE_CLICK_THREAT_RESOLUTION,
				FEATURE_ADVANCED_SEO,
				FEATURE_GOOGLE_ANALYTICS,
				FEATURE_UNLIMITED_PREMIUM_THEMES,
			] ),
		getSignupFeatures: () =>
			compact( [
				FEATURE_UNLIMITED_PREMIUM_THEMES,
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				FEATURE_SEARCH,
				FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per year' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per year' ),
	},

	[ PLAN_JETPACK_BUSINESS_MONTHLY ]: {
		group: GROUP_JETPACK,
		type: TYPE_BUSINESS,
		term: TERM_MONTHLY,
		getTitle: () => i18n.translate( 'Professional' ),
		getAudience: () => i18n.translate( 'Best for organizations' ),
		getSubtitle: () => i18n.translate( 'Ultimate security and traffic tools.' ),
		getProductId: () => 2004,
		getStoreSlug: () => PLAN_JETPACK_BUSINESS_MONTHLY,
		getPathSlug: () => 'professional-monthly',
		availableFor: plan =>
			includes(
				[
					PLAN_JETPACK_FREE,
					PLAN_JETPACK_PREMIUM,
					PLAN_JETPACK_PREMIUM_MONTHLY,
					PLAN_JETPACK_PERSONAL,
					PLAN_JETPACK_PERSONAL_MONTHLY,
				],
				plan
			),
		getDescription: () =>
			i18n.translate(
				'The most powerful WordPress sites: unlimited premium ' +
					'themes, real-time backups, and enhanced search.'
			),
		getTagline: () =>
			i18n.translate(
				'You have full access to premium themes, marketing tools, and priority support.'
			),
		getPlanCompareFeatures: () =>
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
			] ),
		getSignupFeatures: () =>
			compact( [
				FEATURE_UNLIMITED_PREMIUM_THEMES,
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				FEATURE_SEARCH,
				FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
			] ),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' ),
		getSignupBillingTimeFrame: () => i18n.translate( 'per month' ),
	},
};

export const PLANS_CONSTANTS_LIST = Object.keys( PLANS_LIST );

export const FEATURES_LIST = {
	[ FEATURE_BLANK ]: {
		getSlug: () => FEATURE_BLANK,
		getTitle: () => '',
	},

	[ FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All free features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES,
		getTitle: () => i18n.translate( 'All free features' ),
		getDescription: () => i18n.translate( 'Also includes all features offered in the Free plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Personal features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => i18n.translate( 'All Personal features' ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Premium features{{/a}}', {
				components: {
					a: (
						<a
							href="https://jetpack.com/features/comparison"
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => i18n.translate( 'All Premium features' ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ FEATURE_ADVANCED_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_ADVANCED_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Advanced customization' ),
		getDescription: () =>
			i18n.translate(
				'Customize your selected theme template with extended color schemes, background designs, and complete control over website CSS.'
			),
	},

	[ FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_ADVANCED_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Free .blog domain' ),
		getDescription: () =>
			i18n.translate(
				'Get a free custom domain name (example.blog) with this plan to use for your website.'
			),
	},

	[ FEATURE_FREE_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_DOMAIN,
		getTitle: () => i18n.translate( 'Free custom domain' ),
		getDescription: () =>
			i18n.translate(
				'Get a free custom domain name (example.com) with this plan to use for your website.'
			),
	},

	[ FEATURE_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_THEMES,
		getTitle: () => i18n.translate( 'Unlimited premium themes' ),
		getDescription: () =>
			i18n.translate(
				'Unlimited access to all of our advanced premium theme templates, including templates specifically tailored for businesses.'
			),
	},

	[ FEATURE_MONETISE ]: {
		getSlug: () => FEATURE_MONETISE,
		getTitle: () => i18n.translate( 'Monetize your site with ads' ),
		getDescription: () =>
			i18n.translate(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => i18n.translate( 'Upload themes and plugins' ),
		getDescription: () => i18n.translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ FEATURE_GOOGLE_ANALYTICS_SIGNUP ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS_SIGNUP,
		getTitle: () => i18n.translate( 'Google Analytics' ),
	},

	[ FEATURE_EMAIL_SUPPORT_SIGNUP ]: {
		getSlug: () => FEATURE_EMAIL_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Email support' ),
		getDescription: () =>
			i18n.translate(
				'High quality support to help you get your website up and running and working how you want it.'
			),
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT_SIGNUP,
		getTitle: () => i18n.translate( 'Email and live chat support' ),
		getDescription: () =>
			i18n.translate(
				'High quality support to help you get your website up and running and working how you want it.'
			),
	},

	[ FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => i18n.translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			i18n.translate(
				"Access to a wide range of professional theme templates for your website so you can find the exact design you're looking for."
			),
	},

	[ FEATURE_WP_SUBDOMAIN_SIGNUP ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN_SIGNUP,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ FEATURE_UNLIMITED_STORAGE_SIGNUP ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE_SIGNUP,
		getTitle: () => i18n.translate( 'Unlimited storage' ),
		getDescription: () =>
			i18n.translate(
				"With increased storage space you'll be able to upload more images, videos, audio, and documents to your website."
			),
	},

	[ FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => i18n.translate( 'Advanced SEO tools' ),
		getDescription: () =>
			i18n.translate(
				"Adds tools to enhance your site's content for better results on search engines and social media."
			),
	},

	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED_SIGNUP,
		getTitle: () => i18n.translate( 'Unlimited Backup Space' ),
	},

	[ FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => i18n.translate( 'Free WordPress Themes' ),
	},

	[ FEATURE_VIDEO_CDN_LIMITED ]: {
		getSlug: () => FEATURE_VIDEO_CDN_LIMITED,
		getTitle: () => i18n.translate( '13GB Video Storage' ),
		getDescription: () =>
			i18n.translate(
				'High-speed video hosting on our CDN, free of ads and watermarks, fully optimized for WordPress.'
			),
	},

	[ FEATURE_VIDEO_CDN_UNLIMITED ]: {
		getSlug: () => FEATURE_VIDEO_CDN_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Video Storage' ),
	},

	[ FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () =>
			i18n.translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics Integration' ),
		getDescription: () =>
			i18n.translate(
				'Track website statistics with Google Analytics for a ' +
					'deeper understanding of your website visitors and customers.'
			),
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				"With increased storage space you'll be able to upload " +
					'more images, videos, audio, and documents to your website.'
			),
		getStoreSlug: () => 'unlimited_space',
	},

	[ FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_BLOG_DOMAIN,
		getTitle: () => i18n.translate( 'Custom .blog Domain' ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a free custom domain name (example.blog) with this plan ' +
					'to use for your website. Does not apply to premium domains.'
			);
		},
	},

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => FEATURE_CUSTOM_DOMAIN,
		getTitle: () => i18n.translate( 'Custom Domain Name' ),
		getDescription: ( abtest, domainName ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a free custom domain name (example.com) with this plan ' +
					'to use for your website. Does not apply to premium domains.'
			);
		},
	},

	[ FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => i18n.translate( 'Jetpack Essential Features' ),
		getDescription: () =>
			i18n.translate(
				'Improve your SEO, protect your site from spammers, ' +
					'keep a closer eye on your site with expanded activity logs, ' +
					'and automate social media sharing.'
			),
	},

	[ FEATURE_UNLIMITED_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_UNLIMITED_PREMIUM_THEMES,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited{{/strong}} Premium Themes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Unlimited access to all of our advanced premium theme templates, ' +
					'including templates specifically tailored for businesses.'
			),
		getStoreSlug: () => 'unlimited_themes',
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited{{/strong}} Video Hosting', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads, and a fast, unbranded, customizable video player, ' +
					'enhanced with rich stats and unlimited storage space. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => FEATURE_AUDIO_UPLOADS,
		getTitle: () => i18n.translate( 'Audio Upload Support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload audio files that use any major audio file format. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_BASIC_DESIGN ]: {
		getSlug: () => FEATURE_BASIC_DESIGN,
		getTitle: () => i18n.translate( 'Basic Design Customization' ),
		getDescription: () =>
			i18n.translate(
				'Customize your selected theme template with pre-set color schemes, ' +
					'background designs, and font styles.'
			),
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN,
	},

	[ FEATURE_ADVANCED_DESIGN ]: {
		getSlug: () => FEATURE_ADVANCED_DESIGN,
		getTitle: () =>
			i18n.translate( '{{strong}}Advanced{{/strong}} Design Customization', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Customize your selected theme template with extended color schemes, ' +
					'background designs, and complete control over website CSS.'
			),
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN,
	},

	[ FEATURE_NO_ADS ]: {
		getSlug: () => FEATURE_NO_ADS,
		getTitle: () => i18n.translate( 'Remove WordPress.com Ads' ),
		getDescription: () =>
			i18n.translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ FEATURE_REPUBLICIZE ]: {
		getSlug: () => FEATURE_REPUBLICIZE,
		getTitle: () => i18n.translate( 'Advanced Social Media' ),
		getDescription: () =>
			i18n.translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => i18n.translate( 'Simple Payments' ),
		getDescription: () => i18n.translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ FEATURE_NO_BRANDING ]: {
		getSlug: () => FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com Branding' ),
		getDescription: () =>
			i18n.translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ FEATURE_BUSINESS_ONBOARDING ]: {
		getSlug: () => FEATURE_BUSINESS_ONBOARDING,
		getTitle: () => i18n.translate( 'Get Personalized Help' ),
		getDescription: () =>
			i18n.translate(
				'Schedule a one-on-one orientation with a Happiness Engineer to set up your site and learn more about WordPress.com.'
			),
	},

	[ FEATURE_ADVANCED_SEO ]: {
		getSlug: () => FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () =>
			i18n.translate(
				"Adds tools to enhance your site's content for better results on search engines and social media."
			),
	},

	[ FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install Plugins' ),
		getDescription: () => i18n.translate( 'Install custom plugins on your site.' ),
	},

	[ FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES,
		getTitle: () => i18n.translate( 'Upload Themes' ),
		getDescription: () => i18n.translate( 'Upload custom themes on your site.' ),
	},

	[ FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Site Monetization' ),
		getDescription: () =>
			i18n.translate(
				'Put your site to work and earn through ad revenue, easy-to-add PayPal buttons, and more.'
			),
	},

	[ FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com Subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ FEATURE_FREE_THEMES ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of Free Themes' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional theme templates ' +
					"for your website so you can find the exact design you're looking for."
			),
	},

	[ FEATURE_3GB_STORAGE ]: {
		getSlug: () => FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3GB Storage Space' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_6GB_STORAGE ]: {
		getSlug: () => FEATURE_6GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}6GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				"With increased storage space you'll be able to upload " +
					'more images, audio, and documents to your website.'
			),
	},

	[ FEATURE_13GB_STORAGE ]: {
		getSlug: () => FEATURE_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13GB{{/strong}} Storage Space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				"With increased storage space you'll be able to upload " +
					'more images, videos, audio, and documents to your website.'
			),
	},

	[ FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => i18n.translate( 'Community support' ),
		getDescription: () => i18n.translate( 'Get support through our ' + 'user community forums.' ),
	},

	[ FEATURE_EMAIL_SUPPORT ]: {
		getSlug: () => FEATURE_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Email Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with your site.' ),
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Email & Live Chat Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with your site.' ),
	},

	[ FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () =>
			i18n.translate( 'Live chat support to help you get started with Jetpack.' ),
	},

	[ FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard Security Tools' ),
		getDescription: () =>
			i18n.translate(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ FEATURE_SITE_STATS ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Site Stats and Analytics' ),
		getDescription: () => i18n.translate( 'The most important metrics for your site.' ),
	},
	[ FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => FEATURE_TRAFFIC_TOOLS,
		getTitle: () => i18n.translate( 'Traffic and Promotion Tools' ),
		getDescription: () =>
			i18n.translate( 'Build and engage your audience with more than a dozen optimization tools.' ),
	},
	[ FEATURE_MANAGE ]: {
		getSlug: () => FEATURE_MANAGE,
		getTitle: () => i18n.translate( 'Centralized Dashboard' ),
		getDescription: () => i18n.translate( 'Manage all of your WordPress sites from one location.' ),
	},
	[ FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => i18n.translate( 'Spam Protection' ),
		getDescription: () => i18n.translate( 'State-of-the-art spam defense, powered by Akismet.' ),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		getTitle: () => i18n.translate( 'Daily Off-site Backups' ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with ' +
					'unlimited, WordPress-optimized secure storage.'
			),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () =>
			i18n.translate( '{{strong}}Real-time{{/strong}} Off-site Backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automatic realtime backups of every single aspect of your site. ' +
					'Stored safely and optimized for WordPress.'
			),
	},
	[ FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => i18n.translate( '30-day Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ FEATURE_BACKUP_ARCHIVE_15 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_15,
		getTitle: () => i18n.translate( '15-day Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 15 days.' ),
	},
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made since you activated the service.' ),
	},
	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Storage Space' ),
		getDescription: () =>
			i18n.translate( 'Absolutely no limits on storage space for your backups.' ),
	},
	[ FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated Restores' ),
		getDescription: () =>
			i18n.translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy Site Migration' ),
		getDescription: () =>
			i18n.translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () => i18n.translate( 'Daily Malware Scanning' ),
		getDescription: () =>
			i18n.translate(
				'Comprehensive, automated scanning for security vulnerabilities or threats on your site.'
			),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => i18n.translate( 'Daily and On-demand Malware Scanning' ),
		getDescription: () =>
			i18n.translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click Threat Resolution' ),
		getDescription: () =>
			i18n.translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ FEATURE_POLLS_PRO ]: {
		getSlug: () => FEATURE_POLLS_PRO,
		getTitle: () => i18n.translate( 'Advanced Polls and Ratings' ),
		getDescription: () =>
			i18n.translate(
				'Custom polls, surveys, ratings, and quizzes for the ultimate in customer and reader engagement.'
			),
	},

	[ FEATURE_CORE_JETPACK ]: {
		getSlug: () => FEATURE_CORE_JETPACK,
		getTitle: () => i18n.translate( 'Core Jetpack Services' ),
		getDescription: () => i18n.translate( 'Stats, themes, and promotion tools.' ),
		hideInfoPopover: true,
	},
	[ FEATURE_BASIC_SECURITY_JETPACK ]: {
		getSlug: () => FEATURE_BASIC_SECURITY_JETPACK,
		getTitle: () => i18n.translate( 'Basic Security' ),
		getDescription: () =>
			i18n.translate( 'Brute force protection, monitoring, secure logins, updates.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_BASIC_SUPPORT_JETPACK ]: {
		getSlug: () => FEATURE_BASIC_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Basic Support' ),
		getDescription: () => i18n.translate( 'Free support to help you make the most of Jetpack.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_SPEED_JETPACK ]: {
		getSlug: () => FEATURE_SPEED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Unlimited use of our high speed image content delivery network.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_SPEED_ADVANCED_JETPACK ]: {
		getSlug: () => FEATURE_SPEED_ADVANCED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes 13Gb of high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_SPEED_UNLIMITED_JETPACK ]: {
		getSlug: () => FEATURE_SPEED_UNLIMITED_JETPACK,
		getTitle: () => i18n.translate( 'Speed and Storage' ),
		getDescription: () =>
			i18n.translate( 'Also includes unlimited, high-speed, ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_SITE_BACKUPS_JETPACK ]: {
		getSlug: () => FEATURE_SITE_BACKUPS_JETPACK,
		getTitle: () => i18n.translate( 'Site Backups' ),
		getDescription: () =>
			i18n.translate(
				'Automated daily backups (unlimited storage), one-click restores, and 30-day archive.'
			),
		hideInfoPopover: true,
	},

	[ FEATURE_SECURITY_SCANNING_JETPACK ]: {
		getSlug: () => FEATURE_SECURITY_SCANNING_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Security' ),
		getDescription: () =>
			i18n.translate( 'Also includes daily scans for malware and security threats.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_REVENUE_GENERATION_JETPACK ]: {
		getSlug: () => FEATURE_REVENUE_GENERATION_JETPACK,
		getTitle: () => i18n.translate( 'Revenue Generation' ),
		getDescription: () => i18n.translate( 'High-quality ads to generate income from your site.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_VIDEO_HOSTING_JETPACK ]: {
		getSlug: () => FEATURE_VIDEO_HOSTING_JETPACK,
		getTitle: () => i18n.translate( 'Video Hosting' ),
		getDescription: () => i18n.translate( '13Gb of high-speed, HD, and ad-free video hosting.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_SECURITY_ESSENTIALS_JETPACK ]: {
		getSlug: () => FEATURE_SECURITY_ESSENTIALS_JETPACK,
		getTitle: () => i18n.translate( 'Essential Security' ),
		getDescription: () =>
			i18n.translate( 'Daily backups, unlimited storage, one-click restores, spam filtering.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_PRIORITY_SUPPORT_JETPACK ]: {
		getSlug: () => FEATURE_PRIORITY_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () => i18n.translate( 'Faster response times from our security experts.' ),
		hideInfoPopover: true,
	},
	[ FEATURE_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => FEATURE_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Traffic Tools' ),
		getDescription: () =>
			i18n.translate( 'Automatically re-promote existing content to social media.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK ]: {
		getSlug: () => FEATURE_ADVANCED_TRAFFIC_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Traffic Tools' ),
		getDescription: () => i18n.translate( 'Also includes SEO previews and Google Analytics.' ),
		hideInfoPopover: true,
	},

	[ FEATURE_CONCIERGE_SETUP ]: {
		getSlug: () => FEATURE_CONCIERGE_SETUP,
		getTitle: () => i18n.translate( 'Concierge Setup' ),
		getDescription: () =>
			i18n.translate( 'A complimentary one-on-one orientation session with a Jetpack expert.' ),
	},

	[ FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => FEATURE_MARKETING_AUTOMATION,
		getTitle: () => i18n.translate( 'Social Media Automation' ),
		getDescription: () =>
			i18n.translate(
				'Re-share previously published content on social media, or schedule new shares in advance.'
			),
	},

	[ FEATURE_SEARCH ]: {
		getSlug: () => FEATURE_SEARCH,
		getTitle: () => i18n.translate( 'Enhanced Site-wide Search' ),
		getDescription: () =>
			i18n.translate(
				'Fast, relevant search results with custom filtering, powered by Elasticsearch.'
			),
	},
};

export const getPlanObject = planName => {
	const plan = PLANS_LIST[ planName ];
	const objectPlan = {};
	Object.keys( plan ).forEach( key => {
		const objectKey =
			key
				.substr( 3 )
				.charAt( 0 )
				.toLowerCase() + key.slice( 4 );
		objectPlan[ objectKey ] = plan[ key ]();
	} );

	return objectPlan;
};

export const getPlanFeaturesObject = planFeaturesList => {
	return planFeaturesList.map( featuresConst => FEATURES_LIST[ featuresConst ] );
};

export function isMonthly( plan ) {
	return includes( JETPACK_MONTHLY_PLANS, plan );
}

export function isPopular( plan ) {
	return includes( POPULAR_PLANS, plan );
}

export function isNew( plan ) {
	return includes( NEW_PLANS, plan );
}

export function isBestValue( plan ) {
	return includes( BEST_VALUE_PLANS, plan );
}

export function getPlanClass( planKey ) {
	if ( isFreePlan( planKey ) ) {
		return 'is-free-plan';
	}

	if ( isBloggerPlan( planKey ) ) {
		return 'is-blogger-plan';
	}

	if ( isPersonalPlan( planKey ) ) {
		return 'is-personal-plan';
	}

	if ( isPremiumPlan( planKey ) ) {
		return 'is-premium-plan';
	}

	if ( isBusinessPlan( planKey ) ) {
		return 'is-business-plan';
	}

	return '';
}
