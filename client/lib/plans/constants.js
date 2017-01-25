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

// plans constants
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PERSONAL = 'personal-bundle';
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
export const NEW_PLANS = [ PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ];
export const JETPACK_MONTHLY_PLANS = [ PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY ];

export const PLAN_MONTHLY_PERIOD = 31;
export const PLAN_ANNUAL_PERIOD = 365;

// features constants
export const FEATURE_WP_SUBDOMAIN = 'wordpress-subdomain';
export const FEATURE_CUSTOM_DOMAIN = 'custom-domain';
export const FEATURE_JETPACK_ESSENTIAL = 'jetpack-essential';
export const FEATURE_FREE_THEMES = 'free-themes';
export const FEATURE_SELECT_PREMIUM_THEMES = 'select-premium-themes';
export const FEATURE_ALL_PREMIUM_THEMES = 'all-premium-themes';
export const FEATURE_UNLIMITED_PREMIUM_THEMES = 'premium-themes';
export const FEATURE_3GB_STORAGE = '3gb-storage';
export const FEATURE_6GB_STORAGE = '6gb-storage';
export const FEATURE_13GB_STORAGE = '13gb-storage';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_COMMUNITY_SUPPORT = 'community-support';
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

// jetpack features constants
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
export const FEATURE_BASIC_SECURITY_JETPACK = 'basic-security-jetpack';
export const FEATURE_SITE_BACKUPS_JETPACK = 'site-backups-jetpack';
export const FEATURE_REALTIME_BACKUPS_JETPACK = 'realtime-backups-jetpack';
export const FEATURE_SECURITY_SCANNING_JETPACK = 'security-scanning-jetpack';
export const FEATURE_REVENUE_GENERATION_JETPACK = 'revenue-generation-jetpack';
export const FEATURE_VIDEO_HOSTING_JETPACK = 'vidoe-hosting-jetpack';
export const FEATURE_SECURITY_ESSENTIALS_JETPACK = 'security-essentials-jetpack';
export const FEATURE_PRIORITY_SUPPORT_JETPACK = 'priority-support-jetpack';
export const FEATURE_SEO_TOOLS_JETPACK = 'seo-tools-jetpack';

// DO NOT import. Use `getPlan` from `lib/plans` instead.
export const PLANS_LIST = {
	[ PLAN_FREE ]: {
		getTitle: () => i18n.translate( 'Free' ),
		getPriceTitle: () => i18n.translate( 'Free for life' ), //TODO: DO NOT USE
		getProductId: () => 1,
		getStoreSlug: () => PLAN_FREE,
		getPathSlug: () => 'beginner',
		getDescription: () => i18n.translate( 'Get a free website and be on your way to publishing your ' +
			'first post in less than five minutes.' ),
		getFeatures: () => [ // pay attention to ordering, it is used on /plan page
			FEATURE_WP_SUBDOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_COMMUNITY_SUPPORT,
			FEATURE_FREE_THEMES,
			FEATURE_BASIC_DESIGN,
			FEATURE_3GB_STORAGE
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' )
	},

	[ PLAN_PERSONAL ]: {
		getTitle: () => i18n.translate( 'Personal' ),
		getProductId: () => 1009,
		getStoreSlug: () => PLAN_PERSONAL,
		availableFor: ( plan ) => includes( [ PLAN_FREE ], plan ),
		getPathSlug: () => 'personal',
		getDescription: () => i18n.translate( '{{strong}}Best for Personal Use:{{/strong}} Boost your' +
			' website with a custom domain name, and remove all WordPress.com advertising. ' +
			'Get access to high quality email and live chat support.', {
				components: {
					strong: <strong className="plan-features__targeted-description-heading" />
				}
			} ),
		getFeatures: () => [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
			FEATURE_FREE_THEMES,
			FEATURE_BASIC_DESIGN,
			FEATURE_6GB_STORAGE,
			FEATURE_NO_ADS
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},

	[ PLAN_PREMIUM ]: {
		getTitle: () => i18n.translate( 'Premium' ),
		getPriceTitle: () => i18n.translate( '$99 per year' ), //TODO: DO NOT USE
		getProductId: () => 1003,
		getPathSlug: () => 'premium',
		getStoreSlug: () => PLAN_PREMIUM,
		availableFor: ( plan ) => includes( [ PLAN_FREE, PLAN_PERSONAL ], plan ),
		getDescription: () => i18n.translate( '{{strong}}Best for Entrepreneurs & Freelancers:{{/strong}}' +
			' Build a unique website with advanced design tools, CSS editing, lots of space for audio and video,' +
			' and the ability to monetize your site with ads.', {
				components: {
					strong: <strong className="plan-features__targeted-description-heading" />
				}
			} ),
		getFeatures: ( abtest ) => [ // pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
			abtest && abtest( 'premiumSquaredPlansWording' ) === 'withMarketingCopy' ? FEATURE_SELECT_PREMIUM_THEMES : FEATURE_FREE_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_13GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS
		],
		getPromotedFeatures: () => [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_NO_ADS,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_13GB_STORAGE
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},

	[ PLAN_BUSINESS ]: {
		getTitle: () => i18n.translate( 'Business' ),
		getPriceTitle: () => i18n.translate( '$299 per year' ), //TODO: DO NOT USE
		getProductId: () => 1008,
		getStoreSlug: () => PLAN_BUSINESS,
		availableFor: ( plan ) => includes( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM ], plan ),
		getPathSlug: () => 'business',
		getDescription: () => i18n.translate( '{{strong}}Best for Small Business:{{/strong}} Power your' +
			' business website with unlimited premium and business theme templates, Google Analytics support, unlimited' +
			' storage, and the ability to remove WordPress.com branding.', {
				components: {
					strong: <strong className="plan-features__targeted-description-heading" />
				}
			} ),
		getFeatures: ( abtest ) => compact( [ // pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
			abtest && abtest( 'premiumSquaredPlansWording' ) === 'withMarketingCopy'
				? FEATURE_ALL_PREMIUM_THEMES
				: FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_UNLIMITED_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_BUSINESS_ONBOARDING,
			FEATURE_ADVANCED_SEO,
			isEnabled( 'automated-transfer' ) && FEATURE_UPLOAD_PLUGINS,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_NO_BRANDING
		] ),
		getPromotedFeatures: () => [
			FEATURE_UNLIMITED_STORAGE,
			FEATURE_UNLIMITED_PREMIUM_THEMES,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_NO_ADS,
			FEATURE_ADVANCED_DESIGN,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_BUSINESS_ONBOARDING
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},

	[ PLAN_JETPACK_FREE ]: {
		getTitle: () => i18n.translate( 'Free' ),
		getProductId: () => 2002,
		getStoreSlug: () => PLAN_JETPACK_FREE,
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate( 'Everything you need to get started' )
			: i18n.translate(
				'The features most needed by WordPress sites' +
				' — perfectly packaged and optimized for everyone.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
		? [
			FEATURE_CORE_JETPACK,
			FEATURE_BASIC_SECURITY_JETPACK,
			FEATURE_BASIC_SUPPORT_JETPACK ]
		: [
			FEATURE_STANDARD_SECURITY_TOOLS,
			FEATURE_SITE_STATS,
			FEATURE_TRAFFIC_TOOLS,
			FEATURE_MANAGE
		],
		getBillingTimeFrame: () => i18n.translate( 'for life' )
	},
	[ PLAN_JETPACK_PREMIUM ]: {
		getTitle: () => i18n.translate( 'Premium' ),
		getSubtitle: () => i18n.translate( 'Protection, speed, and revenue.' ),
		getProductId: () => 2000,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM,
		availableFor: ( plan ) => includes( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ], plan ),
		getPathSlug: () => 'premium',
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate(
				'Generate income and save on video hosting costs. ' +
				'Improve security with daily backups, malware scanning, and spam defense.'
			)
			: i18n.translate(
				'Protection, speed, and revenue.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
		? [
			FEATURE_CORE_JETPACK,
			FEATURE_SITE_BACKUPS_JETPACK,
			FEATURE_SECURITY_SCANNING_JETPACK,
			FEATURE_REVENUE_GENERATION_JETPACK,
			FEATURE_VIDEO_HOSTING_JETPACK
		]
		: [
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
			FEATURE_MALWARE_SCANNING_DAILY,
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},

	[ PLAN_JETPACK_PREMIUM_MONTHLY ]: {
		getTitle: () => i18n.translate( 'Premium' ),
		getProductId: () => 2003,
		getStoreSlug: () => PLAN_JETPACK_PREMIUM_MONTHLY,
		getPathSlug: () => 'premium-monthly',
		availableFor: ( plan ) => includes( [ PLAN_JETPACK_FREE, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY ], plan ),
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate(
				'Generate income and save on video hosting costs. ' +
				'Improve security with daily backups, malware scanning, and spam defense.'
			)
			: i18n.translate(
				'Protection, speed, and revenue.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
		? [
			FEATURE_CORE_JETPACK,
			FEATURE_SITE_BACKUPS_JETPACK,
			FEATURE_SECURITY_SCANNING_JETPACK,
			FEATURE_REVENUE_GENERATION_JETPACK,
			FEATURE_VIDEO_HOSTING_JETPACK
		] : [
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
			FEATURE_MALWARE_SCANNING_DAILY,
		],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' )
	},

	[ PLAN_JETPACK_PERSONAL ]: {
		getTitle: () => i18n.translate( 'Personal' ),
		getProductId: () => 2005,
		getStoreSlug: () => PLAN_JETPACK_PERSONAL,
		availableFor: ( plan ) => includes( [ PLAN_JETPACK_FREE ], plan ),
		getPathSlug: () => 'jetpack-personal',
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate( 'Everything you need to get started' )
			: i18n.translate(
				'Essentials for every site. The most affordable solution to keep your' +
				' personal or small business site backed up and spam-free.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? [
				FEATURE_CORE_JETPACK,
				FEATURE_SECURITY_ESSENTIALS_JETPACK,
				FEATURE_PRIORITY_SUPPORT_JETPACK
			]
			: [
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
				FEATURE_BACKUP_ARCHIVE_30,
				FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				FEATURE_AUTOMATED_RESTORES,
				FEATURE_SPAM_AKISMET_PLUS,
				FEATURE_EASY_SITE_MIGRATION,
				FEATURE_PREMIUM_SUPPORT
			],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},

	[ PLAN_JETPACK_PERSONAL_MONTHLY ]: {
		getTitle: () => i18n.translate( 'Personal' ),
		getStoreSlug: () => PLAN_JETPACK_PERSONAL_MONTHLY,
		getProductId: () => 2006,
		getPathSlug: () => 'jetpack-personal-monthly',
		availableFor: ( plan ) => includes( [ PLAN_JETPACK_FREE ], plan ),
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate( 'Everything you need to get started' )
			: i18n.translate(
				'Essentials for every site. The most affordable solution to keep your' +
				' personal or small business site backed up and spam-free.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? [
				FEATURE_CORE_JETPACK,
				FEATURE_SECURITY_ESSENTIALS_JETPACK,
				FEATURE_PRIORITY_SUPPORT_JETPACK
			]
			: [
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
				FEATURE_BACKUP_ARCHIVE_30,
				FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				FEATURE_AUTOMATED_RESTORES,
				FEATURE_SPAM_AKISMET_PLUS,
				FEATURE_EASY_SITE_MIGRATION,
				FEATURE_PREMIUM_SUPPORT
			],
		getBillingTimeFrame: () => i18n.translate( 'per month, billed monthly' )
	},

	[ PLAN_JETPACK_BUSINESS ]: {
		getTitle: () => i18n.translate( 'Professional' ),
		getProductId: () => 2001,
		availableFor: ( plan ) => includes( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY
		], plan ),
		getPathSlug: () => 'professional',
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate( 'Ultimate security and traffic tools.' )
			: i18n.translate(
				'Real-time backups, unlimited archives, and one-click threat ' +
				'resolution. Also includes SEO tools, and unlimited video hosting.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? [
				FEATURE_CORE_JETPACK,
				FEATURE_REALTIME_BACKUPS_JETPACK,
				FEATURE_SECURITY_SCANNING_JETPACK,
				FEATURE_REVENUE_GENERATION_JETPACK,
				FEATURE_VIDEO_HOSTING_JETPACK,
				FEATURE_SEO_TOOLS_JETPACK
			]
			: compact( [
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				FEATURE_BACKUP_ARCHIVE_UNLIMITED,
				FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				FEATURE_AUTOMATED_RESTORES,
				FEATURE_SPAM_AKISMET_PLUS,
				FEATURE_EASY_SITE_MIGRATION,
				FEATURE_PREMIUM_SUPPORT,
				FEATURE_WORDADS_INSTANT,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
				FEATURE_ONE_CLICK_THREAT_RESOLUTION,
				FEATURE_ADVANCED_SEO,
				isEnabled( 'jetpack/google-analytics' ) && FEATURE_GOOGLE_ANALYTICS
			]
		),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	},
	[ PLAN_JETPACK_BUSINESS_MONTHLY ]: {
		getTitle: () => i18n.translate( 'Professional' ),
		getSubtitle: () => i18n.translate( 'Ultimate security and traffic tools.' ),
		getProductId: () => 2004,
		getPathSlug: () => 'professional-monthly',
		availableFor: ( plan ) => includes( [
			PLAN_JETPACK_FREE,
			PLAN_JETPACK_PREMIUM,
			PLAN_JETPACK_PREMIUM_MONTHLY,
			PLAN_JETPACK_PERSONAL,
			PLAN_JETPACK_PERSONAL_MONTHLY
		], plan ),
		getDescription: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? i18n.translate( 'Ultimate security and traffic tools.' )
			: i18n.translate(
				'Real-time backups, unlimited archives, and one-click threat ' +
				'resolution. Also includes SEO tools, and unlimited video hosting.'
		),
		getFeatures: ( abtest ) => abtest && abtest( 'jetpackPlansTabs' ) === 'tabs'
			? [
				FEATURE_CORE_JETPACK,
				FEATURE_REALTIME_BACKUPS_JETPACK,
				FEATURE_SECURITY_SCANNING_JETPACK,
				FEATURE_REVENUE_GENERATION_JETPACK,
				FEATURE_VIDEO_HOSTING_JETPACK,
				FEATURE_SEO_TOOLS_JETPACK
			]
			: compact( [
				FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
				FEATURE_BACKUP_ARCHIVE_UNLIMITED,
				FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
				FEATURE_AUTOMATED_RESTORES,
				FEATURE_SPAM_AKISMET_PLUS,
				FEATURE_EASY_SITE_MIGRATION,
				FEATURE_PREMIUM_SUPPORT,
				FEATURE_WORDADS_INSTANT,
				FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
				FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
				FEATURE_ONE_CLICK_THREAT_RESOLUTION,
				FEATURE_ADVANCED_SEO,
				isEnabled( 'jetpack/google-analytics' ) && FEATURE_GOOGLE_ANALYTICS
			]
		),
		getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' )
	}
};

export const FEATURES_LIST = {
	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics Integration' ),
		getDescription: () => i18n.translate(
			'Track website statistics with Google Analytics for a ' +
			'deeper understanding of your website visitors and customers.'
		)
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE,
		getTitle: () => i18n.translate( '{{strong}}Unlimited{{/strong}} Storage Space', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			"With increased storage space you'll be able to upload " +
			'more images, videos, audio, and documents to your website.'
		),
		getStoreSlug: () => 'unlimited_space'
	},

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => FEATURE_CUSTOM_DOMAIN,
		getTitle: () => i18n.translate( 'Custom Domain Name' ),
		getDescription: () => i18n.translate(
			'Get a free custom domain name (example.com) with this plan ' +
			'to use for your website.'
		)
	},

	[ FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => i18n.translate( 'Jetpack Essential Features' ),
		getDescription: () => i18n.translate(
			'Jetpack is a powerful plugin that includes SEO, spam protection, ' +
			'social sharing, site stats, and more.'
		)
	},

	[ FEATURE_UNLIMITED_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_UNLIMITED_PREMIUM_THEMES,
		getTitle: () => i18n.translate( '{{strong}}Unlimited{{/strong}} Premium Themes', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			'Unlimited access to all of our advanced premium theme templates, ' +
			'including templates specifically tailored for businesses.'
		),
		getStoreSlug: () => 'unlimited_themes'
	},

	[ FEATURE_ALL_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_THEMES,
		getTitle: () => i18n.translate( '{{strong}}All{{/strong}} Premium Themes', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			'Unlimited access to all of our advanced premium theme templates, ' +
			'including templates specifically tailored for businesses.'
		),
		getStoreSlug: () => 'unlimited_themes'
	},

	[ FEATURE_SELECT_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_SELECT_PREMIUM_THEMES,
		getTitle: () => i18n.translate( 'Select Premium Themes' ),
		getDescription: () => i18n.translate(
			'Access a selection of our advanced premium theme templates, ' +
			'including templates specifically tailored for businesses.'
		),
		getStoreSlug: () => FEATURE_SELECT_PREMIUM_THEMES
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () => i18n.translate(
			'The easiest way to upload videos to your website and display them ' +
			'using a fast, unbranded, customizable player with rich stats.'
		),
		getStoreSlug: () => 'videopress'
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () => i18n.translate(
			'The easiest way to upload videos to your website and display them ' +
			'using a fast, unbranded, customizable player with rich stats ' +
			'(13GB storage space).'
		),
		getStoreSlug: () => 'videopress'
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		getTitle: () => i18n.translate( 'VideoPress Support' ),
		getDescription: () => i18n.translate(
			'The easiest way to upload videos to your website and display them ' +
			'using a fast, unbranded, customizable player with rich stats ' +
			'(unlimited storage space).'
		),
		getStoreSlug: () => 'videopress'
	},

	[ FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => FEATURE_AUDIO_UPLOADS,
		getTitle: () => i18n.translate( 'Audio Upload Support' ),
		getDescription: () => i18n.translate(
			'The easiest way to upload audio files that use any major audio file format. '
		),
		getStoreSlug: () => 'videopress'
	},

	[ FEATURE_BASIC_DESIGN ]: {
		getSlug: () => FEATURE_BASIC_DESIGN,
		getTitle: () => i18n.translate( 'Basic Design Customization' ),
		getDescription: () => i18n.translate(
			'Customize your selected theme template with pre-set color schemes, ' +
			'background designs, and font styles.'
		),
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN
	},

	[ FEATURE_ADVANCED_DESIGN ]: {
		getSlug: () => FEATURE_ADVANCED_DESIGN,
		getTitle: () => i18n.translate( '{{strong}}Advanced{{/strong}} Design Customization', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			'Customize your selected theme template with extended color schemes, ' +
			'background designs, and complete control over website CSS.'
		),
		getStoreSlug: () => FEATURE_ADVANCED_DESIGN
	},

	[ FEATURE_NO_ADS ]: {
		getSlug: () => FEATURE_NO_ADS,
		getTitle: () => i18n.translate( 'Remove WordPress.com Ads' ),
		getDescription: () => i18n.translate(
			'Allow your visitors to visit and read your website without ' +
			'seeing any WordPress.com advertising.'
		),
		getStoreSlug: () => 'no-adverts/no-adverts.php'
	},

	[ FEATURE_NO_BRANDING ]: {
		getSlug: () => FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com Branding' ),
		getDescription: () => i18n.translate(
			"Keep the focus on your site's brand by removing the WordPress.com footer branding."
		),
		getStoreSlug: () => 'no-adverts/no-adverts.php'
	},

	[ FEATURE_BUSINESS_ONBOARDING ]: {
		getSlug: () => FEATURE_BUSINESS_ONBOARDING,
		getTitle: () => i18n.translate( 'Get Personalized Help' ),
		getDescription: () => i18n.translate(
			'Schedule a one-on-one orientation with a Happiness Engineer to set up your site and learn more about WordPress.com.'
		)
	},

	[ FEATURE_ADVANCED_SEO ]: {
		getSlug: () => FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () => i18n.translate(
			'Adds tools to enhance your site\'s content for better results on search engines and social media.'
		)
	},

	[ FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install Plugins' ),
		getDescription: () => i18n.translate( 'Install custom plugins on your site.' )
	},

	[ FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Monetize Your Site' ),
		getDescription: () => i18n.translate(
			'Add advertising to your site through our WordAds program and earn money from impressions.'
		)
	},

	[ FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com Subdomain' ),
		getDescription: () => i18n.translate(
			'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
		)
	},

	[ FEATURE_FREE_THEMES ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Hundreds of Free Themes' ),
		getDescription: () => i18n.translate(
			'Access to a wide range of professional theme templates ' +
			"for your website so you can find the exact design you're looking for."
		)
	},

	[ FEATURE_3GB_STORAGE ]: {
		getSlug: () => FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3GB Storage Space' ),
		getDescription: () => i18n.translate(
			'Storage space for adding images and documents to your website.'
		)
	},

	[ FEATURE_6GB_STORAGE ]: {
		getSlug: () => FEATURE_6GB_STORAGE,
		getTitle: () => i18n.translate( '{{strong}}6GB{{/strong}} Storage Space', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			"With increased storage space you'll be able to upload " +
			'more images, audio, and documents to your website.'
		)
	},

	[ FEATURE_13GB_STORAGE ]: {
		getSlug: () => FEATURE_13GB_STORAGE,
		getTitle: () => i18n.translate( '{{strong}}13GB{{/strong}} Storage Space', {
			components: {
				strong: <strong />
			}
		} ),
		getDescription: () => i18n.translate(
			'With increased storage space you\'ll be able to upload ' +
			'more images, videos, audio, and documents to your website.'
		)
	},

	[ FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => i18n.translate( 'Community support' ),
		getDescription: () => i18n.translate(
			'Get support through our ' +
			'user community forums.'
		)
	},

	[ FEATURE_EMAIL_LIVE_CHAT_SUPPORT ]: {
		getSlug: () => FEATURE_EMAIL_LIVE_CHAT_SUPPORT,
		getTitle: () => i18n.translate( 'Email & Live Chat Support' ),
		getDescription: () => i18n.translate(
			'High quality support to help you get your website up ' +
			'and running and working how you want it.'
		)
	},

	[ FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () => i18n.translate(
			'High quality support to help you get your website up ' +
			'and running and working how you want it.'
		)
	},

	[ FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard Security Tools' ),
		getDescription: () => i18n.translate(
			'Brute force protection, uptime monitoring, secure sign on, ' +
			'and automatic updates for your plugins.'
		)
	},
	[ FEATURE_SITE_STATS ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Site Stats and Analytics' ),
		getDescription: () => i18n.translate( 'The most important metrics for your site.' )
	},
	[ FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => FEATURE_TRAFFIC_TOOLS,
		getTitle: () => i18n.translate( 'Traffic and Promotion Tools' ),
		getDescription: () => i18n.translate( 'Build and engage your audience with more than a dozen optimization tools.' )
	},
	[ FEATURE_MANAGE ]: {
		getSlug: () => FEATURE_MANAGE,
		getTitle: () => i18n.translate( 'Centralized Dashboard' ),
		getDescription: () => i18n.translate( 'Manage all of your WordPress sites from one location.' )
	},
	[ FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => i18n.translate( 'Spam Protection' ),
		getDescription: () => i18n.translate( 'State-of-the-art spam defense powered by Akismet.' )
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		getTitle: () => i18n.translate( 'Daily Offsite Backups' ),
		getDescription: () => i18n.translate(
			'Automatic daily backups of every single aspect of your site. ' +
			'Stored safely and optimized for WordPress.'
		)
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () => i18n.translate( 'Real-time Offsite Backups' ),
		getDescription: () => i18n.translate(
			'Automatic realtime backups of every single aspect of your site. ' +
			'Stored safely and optimized for WordPress.'
		)
	},
	[ FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => i18n.translate( '30-day Backup Archive' ),
		getDescription: () => i18n.translate( 'Browse or restore any backup made within the past 30 days.' )
	},
	[ FEATURE_BACKUP_ARCHIVE_15 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_15,
		getTitle: () => i18n.translate( '15-day Backup Archive' ),
		getDescription: () => i18n.translate( 'Browse or restore any backup made within the past 15 days.' )
	},
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Archive' ),
		getDescription: () => i18n.translate(
			'Browse or restore any backup made since you activated the service.'
		)
	},
	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited Backup Storage Space' ),
		getDescription: () => i18n.translate( 'Absolutely no limits on storage space for your backups.' )
	},
	[ FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated Restores' ),
		getDescription: () => i18n.translate( 'Restore your site from any available backup with a single click.' )
	},
	[ FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy Site Migration' ),
		getDescription: () => i18n.translate( 'Easily and quickly move or duplicate your site to any location.' )
	},
	[ FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () => i18n.translate( 'Daily Malware Scanning' ),
		getDescription: () => i18n.translate(
			'Comprehensive and automated scanning for any security vulnerabilities or threats on your site.'
		)
	},
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => i18n.translate( 'Daily and On-demand Malware Scanning' ),
		getDescription: () => i18n.translate(
			'Automated security scanning with the option to run complete site scans at any time.'
		)
	},
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click Threat Resolution' ),
		getDescription: () => i18n.translate(
			'Repair any security issues found on your site with just a single click.'
		)
	},
	[ FEATURE_POLLS_PRO ]: {
		getSlug: () => FEATURE_POLLS_PRO,
		getTitle: () => i18n.translate( 'Advanced Polls and Ratings' ),
		getDescription: () => i18n.translate(
			'Custom polls, surveys, ratings, and quizzes for the ultimate in customer and reader engagement.'
		)
	},
	[ FEATURE_CORE_JETPACK ]: {
		getSlug: () => FEATURE_CORE_JETPACK,
		getTitle: () => i18n.translate( 'Core Jetpack Services' ),
		getDescription: () => i18n.translate(
			'Stats, customization, and promotion tools'
		),
		hideInfoPopover: true
	},
	[ FEATURE_BASIC_SECURITY_JETPACK ]: {
		getSlug: () => FEATURE_BASIC_SECURITY_JETPACK,
		getTitle: () => i18n.translate( 'Basic Security' ),
		getDescription: () => i18n.translate(
			'Brute force protection, monitoring, secure logins, updates.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_BASIC_SUPPORT_JETPACK ]: {
		getSlug: () => FEATURE_BASIC_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Basic Support' ),
		getDescription: () => i18n.translate(
			'Standard support for all Jetpack free features.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_SITE_BACKUPS_JETPACK ]: {
		getSlug: () => FEATURE_SITE_BACKUPS_JETPACK,
		getTitle: () => i18n.translate( 'Site Backups' ),
		getDescription: () => i18n.translate(
			'Automated daily backups (unlimited storage), one-click restores, and 30-day archive.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_REALTIME_BACKUPS_JETPACK ]: {
		getSlug: () => FEATURE_REALTIME_BACKUPS_JETPACK,
		getTitle: () => i18n.translate( 'Site Backups' ),
		getDescription: () => i18n.translate(
			'Automated real-time backups (unlimited storage), one-click restores, and unlimited archive.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_SECURITY_SCANNING_JETPACK ]: {
		getSlug: () => FEATURE_SECURITY_SCANNING_JETPACK,
		getTitle: () => i18n.translate( 'Security Scanning' ),
		getDescription: () => i18n.translate(
			'Daily scans for malware and threats with manual resolution.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_REVENUE_GENERATION_JETPACK ]: {
		getSlug: () => FEATURE_REVENUE_GENERATION_JETPACK,
		getTitle: () => i18n.translate( 'Revenue Generation' ),
		getDescription: () => i18n.translate(
			'Display high-quality ads to generate income directly from your site.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_VIDEO_HOSTING_JETPACK ]: {
		getSlug: () => FEATURE_VIDEO_HOSTING_JETPACK,
		getTitle: () => i18n.translate( 'Video Hosting' ),
		getDescription: () => i18n.translate(
			'13Gb of high-speed, HD, and ad-free video hosting.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_SECURITY_ESSENTIALS_JETPACK ]: {
		getSlug: () => FEATURE_SECURITY_ESSENTIALS_JETPACK,
		getTitle: () => i18n.translate( 'Security Essentials' ),
		getDescription: () => i18n.translate(
			'Daily backups, unlimited storage, one-click restores, and spam filtering.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_PRIORITY_SUPPORT_JETPACK ]: {
		getSlug: () => FEATURE_PRIORITY_SUPPORT_JETPACK,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () => i18n.translate(
			'Fast, dedicated support from our WordPress security experts.'
		),
		hideInfoPopover: true
	},
	[ FEATURE_SEO_TOOLS_JETPACK ]: {
		getSlug: () => FEATURE_SEO_TOOLS_JETPACK,
		getTitle: () => i18n.translate( 'SEO Tools' ),
		getDescription: () => i18n.translate(
			'Preview and optimize site content for better search engine results.'
		),
		hideInfoPopover: true
	},

};

export const getPlanObject = planName => {
	const plan = PLANS_LIST[ planName ];
	const objectPlan = {};
	Object.keys( plan ).forEach( key => {
		const objectKey = key.substr( 3 ).charAt( 0 ).toLowerCase() + key.slice( 4 );
		objectPlan[ objectKey ] = plan[ key ]();
	} );

	return objectPlan;
};

export const getPlanFeaturesObject = planFeaturesList => {
	return planFeaturesList.map( featuresConst =>
		FEATURES_LIST[ featuresConst ]
	);
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

export function getPlanClass( plan ) {
	switch ( plan ) {
		case PLAN_JETPACK_FREE:
		case PLAN_FREE:
			return 'is-free-plan';
		case PLAN_PERSONAL:
		case PLAN_JETPACK_PERSONAL:
		case PLAN_JETPACK_PERSONAL_MONTHLY:
			return 'is-personal-plan';
		case PLAN_PREMIUM:
		case PLAN_JETPACK_PREMIUM:
		case PLAN_JETPACK_PREMIUM_MONTHLY:
			return 'is-premium-plan';
		case PLAN_BUSINESS:
		case PLAN_JETPACK_BUSINESS:
		case PLAN_JETPACK_BUSINESS_MONTHLY:
			return 'is-business-plan';
		default:
			return '';
	}
}

export function getMonthlyPlanByYearly( plan ) {
	switch ( plan ) {
		case PLAN_JETPACK_PREMIUM:
			return PLAN_JETPACK_PREMIUM_MONTHLY;
		case PLAN_JETPACK_BUSINESS:
			return PLAN_JETPACK_BUSINESS_MONTHLY;
		case PLAN_JETPACK_PERSONAL:
			return PLAN_JETPACK_PERSONAL_MONTHLY;
		default:
			return '';
	}
}
