import { isEnabled } from '@automattic/calypso-config';
import i18n, { getLocaleSlug, translate } from 'i18n-calypso';
import {
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_1GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_ACTIVITY_LOG,
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
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
	FEATURE_WAF,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_AUTOMATED_RESTORES,
	FEATURE_AUTOMATIC_SECURITY_FIXES,
	FEATURE_BACKUP_ARCHIVE_30,
	FEATURE_BACKUP_ARCHIVE_UNLIMITED,
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
	FEATURE_BLANK,
	FEATURE_BLOG_DOMAIN,
	FEATURE_CLOUDFLARE_ANALYTICS,
	FEATURE_COLLECT_PAYMENTS_V2,
	FEATURE_COMMUNITY_SUPPORT,
	FEATURE_CRM_V2,
	FEATURE_CSS_CUSTOMIZATION,
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
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	FEATURE_JETPACK_1TB_BACKUP_STORAGE,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_JETPACK_CRM,
	FEATURE_JETPACK_CRM_MONTHLY,
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_JETPACK_PRODUCT_BACKUP,
	FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
	FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
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
	FEATURE_SOCIAL_MEDIA_TOOLS,
	FEATURE_SPAM_AKISMET_PLUS,
	FEATURE_STANDARD_SECURITY_TOOLS,
	FEATURE_TITAN_EMAIL,
	FEATURE_TRAFFIC_TOOLS,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
	FEATURE_WP_SUBDOMAIN,
	FEATURE_WP_SUBDOMAIN_SIGNUP,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_UNLIMITED_TRAFFIC,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_WOOCOMMERCE,
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
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_P2_FREE,
	PLAN_P2_PLUS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_PERSONAL_MONTHLY,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PREMIUM_MONTHLY,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_PRO_MONTHLY,
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
	TYPE_FLEXIBLE,
	TYPE_PRO,
	TYPE_STARTER,
	WPCOM_FEATURES_ATOMIC,
	WPCOM_FEATURES_SCAN,
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_BACKUPS,
	FEATURE_MANAGED_HOSTING,
	FEATURE_UNLIMITED_EMAILS,
	FEATURE_UNLIMITED_SUBSCRIBERS,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
	FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
	FEATURE_POST_BY_EMAIL,
	FEATURE_GOOGLE_ANALYTICS_V2,
	FEATURE_ADD_UNLIMITED_LINKS,
	FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
	FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
	FEATURE_TRACK_VIEWS_CLICKS,
	FEATURE_LINK_IN_BIO_THEMES_CUSTOMIZATION,
	FEATURE_REAL_TIME_ANALYTICS,
	JETPACK_TAG_FOR_WOOCOMMERCE_STORES,
	JETPACK_TAG_FOR_NEWS_ORGANISATIONS,
	JETPACK_TAG_FOR_MEMBERSHIP_SITES,
	JETPACK_TAG_FOR_ONLINE_FORUMS,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION_AND_CSS,
} from './constants';
import type {
	BillingTerm,
	Plan,
	JetpackPlan,
	WPComPlan,
	IncompleteWPcomPlan,
	IncompleteJetpackPlan,
	CancellationFeatureList,
} from './types';
import type { TranslateResult } from 'i18n-calypso';

function isValueTruthy< T >( value: T ): value is Exclude< T, null | undefined | false | 0 | '' > {
	return !! value;
}

function compact( elements: ( string | false | undefined | null )[] ): string[] {
	return elements.filter( isValueTruthy );
}

const WPComGetBillingTimeframe = (): TranslateResult =>
	i18n.translate( 'per month, billed annually' );
const WPComGetBiennialBillingTimeframe = (): TranslateResult =>
	i18n.translate( '/month, billed every two years' );

const getAnnualTimeframe = (): BillingTerm => ( {
	term: TERM_ANNUALLY,
	getBillingTimeFrame: () => translate( 'per year' ),
} );

const getMonthlyTimeframe = (): BillingTerm => ( {
	term: TERM_MONTHLY,
	getBillingTimeFrame: () => translate( 'per month, billed monthly' ),
} );
const getJetpackCommonPlanDetails = () => ( {
	getRecommendedFor: () => [
		{ tag: JETPACK_TAG_FOR_WOOCOMMERCE_STORES, label: translate( 'WooCommerce stores' ) },
		{ tag: JETPACK_TAG_FOR_NEWS_ORGANISATIONS, label: translate( 'News organizations' ) },
		{ tag: JETPACK_TAG_FOR_MEMBERSHIP_SITES, label: translate( 'Membership sites' ) },
		{ tag: JETPACK_TAG_FOR_ONLINE_FORUMS, label: translate( 'Online forums' ) },
	],
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

const cancellationFeatureListTerms = {
	ACCEPT_PAYMENTS: i18n.translate( 'Accept payments in 60+ countries' ),
	AD_FREE_SITE: i18n.translate( 'An ad-free site' ),
	AND_MORE: i18n.translate( 'and more…' ),
	BACKUPS: i18n.translate( 'Automated website backups' ),
	BACKUPS_AND_RESTORE: i18n.translate( 'Automated site backups and one-click restore' ),
	COLLECT_PAYMENTS: i18n.translate( 'The ability to collect payments' ),
	EARN_AD_REVENUE: i18n.translate( 'The ability to earn ad revenue' ),
	EMAIL_SUPPORT: i18n.translate( 'Unlimited customer support via email' ),
	GOOGLE_ANALYTICS: i18n.translate( 'Google Analytics integration' ),
	HIGH_QUALITY_VIDEOS: i18n.translate( 'High quality videos' ),
	JETPACK_ESSENTIALS: i18n.translate( 'Jetpack essentials' ),
	LIVE_CHAT: i18n.translate( 'Access to live chat support' ),
	MANAGED_HOSTINGS: i18n.translate( 'Access to managed hosting' ),
	PLUGINS: i18n.translate( 'Access to more than 50,000 plugins' ),
	PREMIUM_DESIGN: i18n.translate( 'Premium design options customized for online stores' ),
	PREMIUM_THEMES: i18n.translate( 'Access to premium themes' ),
	SECURITY_AND_SPAM: i18n.translate( 'Professional security and spam protection' ),
	SEO_TOOLS: i18n.translate( 'Advanced SEO tools' ),
	SEO_AND_SOCIAL: i18n.translate( 'SEO and social tools' ),
	SFTP_AND_DATABASE: i18n.translate( 'SFTP and database access' ),
	SHIPPING_CARRIERS: i18n.translate( 'Integration with top shipping carriers' ),
	UNLIMITED_TRAFFIC: i18n.translate( 'Unlimited traffic' ),
};

const getPlanBloggerDetails = (): IncompleteWPcomPlan => ( {
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
	getIncludedFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
	getInferiorFeatures: () => [],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
		yearly: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
		withDomain: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
	} ),
} );

const getPlanPersonalDetails = (): IncompleteWPcomPlan => ( {
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
	getPlanCompareFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_HOSTING,
			FEATURE_JETPACK_ESSENTIAL,
			FEATURE_EMAIL_SUPPORT,
			FEATURE_FREE_THEMES,
			FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
			FEATURE_6GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
		] ),
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
	getNewsletterDescription: () =>
		i18n.translate(
			'Jumpstart your Newsletter with a custom domain, ad-free experience, and the ability to sell subscriptions, take payments, and collect donations from day one. Backed with email support to help get everything just right.'
		),
	getNewsletterSignupFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_UNLIMITED_EMAILS,
		FEATURE_UNLIMITED_SUBSCRIBERS,
		// we don't offer this one yet
		// FEATURE_IMPORT_SUBSCRIBERS,
		FEATURE_AD_FREE_EXPERIENCE,
		FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
		FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
		FEATURE_POST_BY_EMAIL,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
	],
	getNewsletterHighlightedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_UNLIMITED_EMAILS,
		FEATURE_UNLIMITED_SUBSCRIBERS,
		FEATURE_AD_FREE_EXPERIENCE,
	],
	getLinkInBioDescription: () =>
		i18n.translate(
			'Stand out and unlock earnings with an ad-free site, custom domain, and the ability to sell subscriptions, take payments, and collect donations. Backed with email support to help get your site just right.'
		),
	getLinkInBioSignupFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_ADD_UNLIMITED_LINKS,
		FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		FEATURE_AD_FREE_EXPERIENCE,
		FEATURE_TRACK_VIEWS_CLICKS,
		FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
		FEATURE_POST_BY_EMAIL,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
	],
	getLinkInBioHighlightedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_ADD_UNLIMITED_LINKS,
		FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		FEATURE_TRACK_VIEWS_CLICKS,
	],
	// Features not displayed but used for checking plan abilities
	getIncludedFeatures: () => [ FEATURE_AUDIO_UPLOADS ],
	getInferiorFeatures: () => [],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
		yearly: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
		withDomain: [
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
	} ),
} );

const getPlanEcommerceDetails = (): IncompleteWPcomPlan => ( {
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
			FEATURE_HOSTING,
			FEATURE_JETPACK_ADVANCED,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
			FEATURE_200GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_CSS_CUSTOMIZATION,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_ADVANCED_SEO,
			FEATURE_UPLOAD_PLUGINS,
			FEATURE_UPLOAD_THEMES,
			FEATURE_SFTP_DATABASE,
			FEATURE_NO_BRANDING,
			FEATURE_ACCEPT_PAYMENTS,
			FEATURE_SHIPPING_CARRIERS,
			FEATURE_UNLIMITED_PRODUCTS_SERVICES,
			FEATURE_ECOMMERCE_MARKETING,
			FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		] ),
	getPromotedFeatures: () => [
		FEATURE_200GB_STORAGE,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_CSS_CUSTOMIZATION,
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
	getSignupCompareAvailableFeatures: () =>
		[
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_HOSTING,
			FEATURE_NO_ADS,
			FEATURE_COLLECT_PAYMENTS_V2,
			FEATURE_EMAIL_SUPPORT_SIGNUP,
			FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_EARN_AD,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_INSTALL_PLUGINS,
			FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
			FEATURE_SITE_BACKUPS_AND_RESTORE,
			FEATURE_SFTP_DATABASE,
			FEATURE_ACCEPT_PAYMENTS,
			FEATURE_SHIPPING_CARRIERS,
			PREMIUM_DESIGN_FOR_STORES,
		].filter( isValueTruthy ),
	// Features not displayed but used for checking plan abilities
	getIncludedFeatures: () => [
		FEATURE_AUDIO_UPLOADS,
		FEATURE_GOOGLE_MY_BUSINESS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
		FEATURE_UPLOAD_THEMES_PLUGINS,
		FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
		FEATURE_SEO_PREVIEW_TOOLS,
		WPCOM_FEATURES_ATOMIC,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getInferiorFeatures: () => [],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.ACCEPT_PAYMENTS,
			cancellationFeatureListTerms.SHIPPING_CARRIERS,
			cancellationFeatureListTerms.PREMIUM_DESIGN,
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.SEO_TOOLS,
			cancellationFeatureListTerms.AND_MORE,
		],
		yearly: [
			cancellationFeatureListTerms.ACCEPT_PAYMENTS,
			cancellationFeatureListTerms.SHIPPING_CARRIERS,
			cancellationFeatureListTerms.PREMIUM_DESIGN,
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.SEO_TOOLS,
			cancellationFeatureListTerms.AND_MORE,
		],
		withDomain: [
			cancellationFeatureListTerms.ACCEPT_PAYMENTS,
			cancellationFeatureListTerms.SHIPPING_CARRIERS,
			cancellationFeatureListTerms.PREMIUM_DESIGN,
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.AND_MORE,
		],
	} ),
} );

const getPlanPremiumDetails = (): IncompleteWPcomPlan => ( {
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
			FEATURE_HOSTING,
			FEATURE_JETPACK_ESSENTIAL,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
			FEATURE_13GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_CSS_CUSTOMIZATION,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
		] ),
	getPromotedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_CSS_CUSTOMIZATION,
		FEATURE_13GB_STORAGE,
	],
	getSignupFeatures: () => [
		FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
		FEATURE_ADVANCED_DESIGN_CUSTOMIZATION_AND_CSS,
		FEATURE_ALL_PERSONAL_FEATURES,
	],
	getNewsletterDescription: () =>
		i18n.translate(
			'Take your Newsletter further, faster. Get everything included in Personal, plus premium design themes, baked-in video uploads, ad monetization, deep visitor insights from Google Analytics, and live chat support.'
		),
	getNewsletterSignupFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_UNLIMITED_EMAILS,
		FEATURE_UNLIMITED_SUBSCRIBERS,
		FEATURE_LIVE_CHAT_SUPPORT,
		FEATURE_REAL_TIME_ANALYTICS,
		FEATURE_AD_FREE_EXPERIENCE,
		FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
		FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
		FEATURE_POST_BY_EMAIL,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		// For context, see: https://github.com/Automattic/wp-calypso/issues/68150
		// FEATURE_IMPORT_SUBSCRIBERS,
		// FEATURE_GOOGLE_ANALYTICS_V2,
		// FEATURE_PREMIUM_THEMES,
	],
	getNewsletterHighlightedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_UNLIMITED_EMAILS,
		FEATURE_UNLIMITED_SUBSCRIBERS,
		FEATURE_AD_FREE_EXPERIENCE,
		FEATURE_LIVE_CHAT_SUPPORT,
		FEATURE_REAL_TIME_ANALYTICS,
		FEATURE_PREMIUM_THEMES,
	],
	getLinkInBioDescription: () =>
		i18n.translate(
			'Take your site further, faster. Get everything included in Personal, plus premium design themes, baked-in video uploads, ad monetization, deep visitor insights from Google Analytics, and live chat support.'
		),
	getLinkInBioSignupFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_ADD_UNLIMITED_LINKS,
		FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		FEATURE_AD_FREE_EXPERIENCE,
		FEATURE_TRACK_VIEWS_CLICKS,
		FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
		FEATURE_POST_BY_EMAIL,
		FEATURE_EMAIL_SUPPORT_SIGNUP,
		FEATURE_LIVE_CHAT_SUPPORT,
		FEATURE_REAL_TIME_ANALYTICS,
		FEATURE_GOOGLE_ANALYTICS_V2,
		FEATURE_MONETISE,
		FEATURE_LINK_IN_BIO_THEMES_CUSTOMIZATION,
	],
	getLinkInBioHighlightedFeatures: () => [
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_ADD_UNLIMITED_LINKS,
		FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		FEATURE_TRACK_VIEWS_CLICKS,
	],
	getBlogSignupFeatures: () =>
		[
			FEATURE_MONETISE,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ALL_PERSONAL_FEATURES,
		].filter( isValueTruthy ),
	getPortfolioSignupFeatures: () =>
		[
			FEATURE_ADVANCED_DESIGN_CUSTOMIZATION_AND_CSS,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ALL_PERSONAL_FEATURES,
		].filter( isValueTruthy ),
	getSignupCompareAvailableFeatures: () =>
		[
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_HOSTING,
			FEATURE_NO_ADS,
			FEATURE_COLLECT_PAYMENTS_V2,
			FEATURE_EMAIL_SUPPORT_SIGNUP,
			FEATURE_LIVE_CHAT_SUPPORT_BUSINESS_DAYS,
			FEATURE_EARN_AD,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_GOOGLE_ANALYTICS,
		].filter( isValueTruthy ),
	// Features not displayed but used for checking plan abilities
	getIncludedFeatures: () => [
		FEATURE_AUDIO_UPLOADS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getInferiorFeatures: () => [],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.GOOGLE_ANALYTICS,
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
		],
		yearly: [
			cancellationFeatureListTerms.LIVE_CHAT,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.GOOGLE_ANALYTICS,
			cancellationFeatureListTerms.AD_FREE_SITE,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
		],
		withDomain: [
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.GOOGLE_ANALYTICS,
			cancellationFeatureListTerms.COLLECT_PAYMENTS,
			cancellationFeatureListTerms.AD_FREE_SITE,
		],
	} ),
} );

const getPlanBusinessDetails = (): IncompleteWPcomPlan => ( {
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
				' business website with custom plugins and themes,' +
				' 200 GB storage, and the ability to remove WordPress.com branding.',
			plansDescriptionHeadingComponent
		),
	getShortDescription: () =>
		i18n.translate(
			'Power your business website with custom plugins and themes,' +
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
			FEATURE_HOSTING,
			FEATURE_JETPACK_ADVANCED,
			isLoggedInMonthlyPricing && FEATURE_EMAIL_SUPPORT,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
			FEATURE_200GB_STORAGE,
			FEATURE_NO_ADS,
			FEATURE_MEMBERSHIPS,
			FEATURE_PREMIUM_CONTENT_BLOCK,
			FEATURE_CSS_CUSTOMIZATION,
			isLoggedInMonthlyPricing && FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_REPUBLICIZE,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS,
			FEATURE_ADVANCED_SEO,
			FEATURE_UPLOAD_PLUGINS,
			FEATURE_UPLOAD_THEMES,
			FEATURE_SFTP_DATABASE,
			FEATURE_NO_BRANDING,
		] ),
	getPromotedFeatures: () => [
		FEATURE_200GB_STORAGE,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_NO_ADS,
		FEATURE_CSS_CUSTOMIZATION,
		FEATURE_VIDEO_UPLOADS,
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
	getSignupCompareAvailableFeatures: () =>
		[
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_HOSTING,
			FEATURE_NO_ADS,
			FEATURE_COLLECT_PAYMENTS_V2,
			FEATURE_EMAIL_SUPPORT_SIGNUP,
			FEATURE_LIVE_CHAT_SUPPORT_ALL_DAYS,
			FEATURE_EARN_AD,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_INSTALL_PLUGINS,
			FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
			FEATURE_SITE_BACKUPS_AND_RESTORE,
			FEATURE_SFTP_DATABASE,
		].filter( isValueTruthy ),
	// Features not displayed but used for checking plan abilities
	getIncludedFeatures: () => [
		FEATURE_AUDIO_UPLOADS,
		FEATURE_GOOGLE_MY_BUSINESS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
		FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
		FEATURE_SEO_PREVIEW_TOOLS,
		WPCOM_FEATURES_ATOMIC,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getInferiorFeatures: () => [],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.SEO_TOOLS,
			cancellationFeatureListTerms.BACKUPS_AND_RESTORE,
			cancellationFeatureListTerms.SFTP_AND_DATABASE,
			cancellationFeatureListTerms.EMAIL_SUPPORT,
			cancellationFeatureListTerms.AND_MORE,
		],
		yearly: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.SEO_TOOLS,
			cancellationFeatureListTerms.BACKUPS_AND_RESTORE,
			cancellationFeatureListTerms.SFTP_AND_DATABASE,
			cancellationFeatureListTerms.LIVE_CHAT,
			cancellationFeatureListTerms.AND_MORE,
		],
		withDomain: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.SEO_TOOLS,
			cancellationFeatureListTerms.BACKUPS_AND_RESTORE,
			cancellationFeatureListTerms.SFTP_AND_DATABASE,
			cancellationFeatureListTerms.AND_MORE,
		],
	} ),
} );

const getPlanProDetails = (): IncompleteWPcomPlan => ( {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_PRO,
	getTitle: () => i18n.translate( 'WordPress Pro' ),
	getDescription: () =>
		i18n.translate(
			'Unlock the full power of WordPress with plugins, custom themes and much more.'
		),
	getSubTitle: () => i18n.translate( 'Unlimited features. Unbeatable value.' ),
	getPlanCompareFeatures: () => [
		FEATURE_UNLIMITED_TRAFFIC,
		FEATURE_MANAGED_HOSTING,
		FEATURE_FREE_THEMES,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_PREMIUM_THEMES,
		FEATURE_INSTALL_PLUGINS,
		WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
		FEATURE_PREMIUM_SUPPORT,
		FEATURE_WOOCOMMERCE,
		FEATURE_50GB_STORAGE,
		FEATURE_NO_ADS,
		FEATURE_ADVANCED_SEO,
		FEATURE_UNLIMITED_ADMINS,
		FEATURE_VIDEO_UPLOADS,
		FEATURE_PAYMENT_BLOCKS,
		FEATURE_SOCIAL_MEDIA_TOOLS,
		FEATURE_TITAN_EMAIL,
		FEATURE_MONETISE,
		FEATURE_SFTP_DATABASE,
		FEATURE_SITE_BACKUPS_AND_RESTORE,
		FEATURE_JETPACK_ESSENTIAL,
		FEATURE_SIMPLE_PAYMENTS,
		FEATURE_WORDADS_INSTANT,
		FEATURE_GOOGLE_ANALYTICS,
	],
	getIncludedFeatures: () => [
		FEATURE_CSS_CUSTOMIZATION,
		FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		FEATURE_AUDIO_UPLOADS,
		FEATURE_CLOUDFLARE_ANALYTICS,
		FEATURE_COLLECT_PAYMENTS_V2,
		FEATURE_EARN_AD,
		FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_GOOGLE_MY_BUSINESS,
		FEATURE_HOSTING,
		FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
		FEATURE_MEMBERSHIPS,
		FEATURE_NO_BRANDING,
		FEATURE_REPUBLICIZE,
		FEATURE_PREMIUM_CONTENT_BLOCK,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_SFTP_DATABASE,
		FEATURE_SITE_BACKUPS_AND_RESTORE,
		FEATURE_UPLOAD_PLUGINS,
		FEATURE_UPLOAD_THEMES,
		FEATURE_UPLOAD_THEMES_PLUGINS,
		WPCOM_FEATURES_ATOMIC,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.HIGH_QUALITY_VIDEOS,
			cancellationFeatureListTerms.SFTP_AND_DATABASE,
			cancellationFeatureListTerms.AND_MORE,
		],
		yearly: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.HIGH_QUALITY_VIDEOS,
			cancellationFeatureListTerms.SFTP_AND_DATABASE,
			cancellationFeatureListTerms.AND_MORE,
		],
		withDomain: [
			cancellationFeatureListTerms.PLUGINS,
			cancellationFeatureListTerms.PREMIUM_THEMES,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.HIGH_QUALITY_VIDEOS,
			cancellationFeatureListTerms.AND_MORE,
		],
	} ),
} );

const getJetpackPersonalDetails = (): IncompleteJetpackPlan => ( {
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
	getIncludedFeatures: () => [
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
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
} );

const getJetpackPremiumDetails = (): IncompleteJetpackPlan => ( {
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
	getIncludedFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_BACKUP_ARCHIVE_30,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_REPUBLICIZE,
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
			FEATURE_JETPACK_VIDEOPRESS,
			FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_MALWARE_SCANNING_DAILY,
			FEATURE_AUTOMATIC_SECURITY_FIXES,
			FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
			FEATURE_WORDADS_INSTANT,
			FEATURE_ADVANCED_SEO,
			FEATURE_ALL_FREE_FEATURES_JETPACK,
			WPCOM_FEATURES_SCAN,
			WPCOM_FEATURES_ANTISPAM,
			WPCOM_FEATURES_BACKUPS,
		] ),
} );

const getJetpackBusinessDetails = (): IncompleteJetpackPlan => ( {
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
		isEnabled( 'themes/premium' )
			? i18n.translate(
					'{{strong}}Best for organizations:{{/strong}} The most powerful WordPress sites.',
					plansDescriptionHeadingComponent
			  )
			: i18n.translate(
					'{{strong}}Best for organizations:{{/strong}} The most powerful WordPress sites: real-time backups ' +
						'and premium themes.',
					plansDescriptionHeadingComponent
			  ),
	getTagline: () => i18n.translate( 'You have the full suite of security and performance tools.' ),
	getPlanCardFeatures: () => [
		FEATURE_BACKUP_REALTIME_V2,
		FEATURE_PRODUCT_SCAN_REALTIME_V2,
		FEATURE_ANTISPAM_V2,
	],
	getIncludedFeatures: () =>
		compact( [
			// pay attention to ordering, shared features should align on /plan page
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
			FEATURE_BACKUP_ARCHIVE_UNLIMITED,
			FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
			FEATURE_AUTOMATED_RESTORES,
			FEATURE_SPAM_AKISMET_PLUS,
			FEATURE_EASY_SITE_MIGRATION,
			FEATURE_PREMIUM_SUPPORT,
			FEATURE_REPUBLICIZE,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
			FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
			FEATURE_ONE_CLICK_THREAT_RESOLUTION,
			FEATURE_ADVANCED_SEO,
			FEATURE_GOOGLE_ANALYTICS,
			FEATURE_JETPACK_BACKUP_REALTIME,
			FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
			FEATURE_JETPACK_SCAN_DAILY,
			FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
			FEATURE_JETPACK_ANTI_SPAM,
			FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
			FEATURE_JETPACK_VIDEOPRESS,
			FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
			WPCOM_FEATURES_SCAN,
			WPCOM_FEATURES_ANTISPAM,
			WPCOM_FEATURES_BACKUPS,
		] ),
	getInferiorFeatures: () => [ FEATURE_JETPACK_BACKUP_DAILY, FEATURE_JETPACK_BACKUP_DAILY_MONTHLY ],
} );

const getPlanJetpackSecurityDailyDetails = (): IncompleteJetpackPlan => ( {
	group: GROUP_JETPACK,
	type: TYPE_SECURITY_DAILY,
	getTitle: () => translate( 'Security {{em}}Daily{{/em}}', { components: { em: <em /> } } ),
	availableFor: ( plan ) => [ PLAN_JETPACK_FREE, ...JETPACK_LEGACY_PLANS ].includes( plan ),
	getDescription: () =>
		translate(
			'All of the essential Jetpack Security features in one package including VaultPress Backup, Scan, Akismet Anti-spam and more.'
		),
	getTagline: () => translate( 'Best for sites with occasional updates' ),
	getPlanCardFeatures: () => [
		FEATURE_PRODUCT_BACKUP_DAILY_V2,
		FEATURE_PRODUCT_SCAN_DAILY_V2,
		FEATURE_ANTISPAM_V2,
		FEATURE_WAF,
	],
	getIncludedFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_JETPACK_SCAN_DAILY,
		FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
		FEATURE_JETPACK_ANTI_SPAM,
		FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
		FEATURE_REPUBLICIZE,
		FEATURE_ADVANCED_SEO,
		FEATURE_SEO_PREVIEW_TOOLS,
		FEATURE_SIMPLE_PAYMENTS,
		FEATURE_WORDADS_INSTANT,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_PREMIUM_SUPPORT,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
} );

const getPlanJetpackSecurityRealtimeDetails = (): IncompleteJetpackPlan => ( {
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
	getIncludedFeatures: () => [
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
		FEATURE_PREMIUM_SUPPORT,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getInferiorFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
	],
} );

const getPlanJetpackSecurityT1Details = (): IncompleteJetpackPlan => ( {
	...getJetpackCommonPlanDetails(),
	group: GROUP_JETPACK,
	type: TYPE_SECURITY_T1,
	getTitle: () => translate( 'Security' ),
	availableFor: ( plan ) => [ PLAN_JETPACK_FREE, ...JETPACK_LEGACY_PLANS ].includes( plan ),
	getDescription: () =>
		translate(
			'Easy-to-use, comprehensive WordPress site security including backups, malware scanning, and spam protection.'
		),
	getFeaturedDescription: () =>
		translate(
			'Easy-to-use, comprehensive WordPress site security including backups, malware scanning, and spam protection.'
		),
	getLightboxDescription: () =>
		translate(
			'Easy-to-use, comprehensive WordPress site security including backups, malware scanning, and spam protection.{{br/}}Includes VaultPress Backup, Jetpack Scan, and Akismet Anti-spam.',
			{
				components: {
					br: <br />,
				},
				comment: '{{br/}} represents a line break',
			}
		),
	getPlanCardFeatures: () => [
		FEATURE_JETPACK_PRODUCT_BACKUP,
		FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
		FEATURE_ANTISPAM_V2,
		FEATURE_WAF,
	],
	getIncludedFeatures: () => [
		FEATURE_JETPACK_BACKUP_T1_YEARLY,
		FEATURE_JETPACK_BACKUP_T1_MONTHLY,
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
		FEATURE_PREMIUM_SUPPORT,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getBenefits: () => [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Learn about issues before your customers are impacted' ),
		translate( 'Restore your site in one click from desktop or mobile' ),
		translate( 'Fix your site without a developer' ),
		translate( 'Protect Woo order and customer data' ),
		translate( 'Save time manually reviewing spam' ),
		translate( 'Best-in-class support from WordPress experts' ),
	],
	getInferiorFeatures: () => [ FEATURE_JETPACK_BACKUP_DAILY, FEATURE_JETPACK_BACKUP_DAILY_MONTHLY ],
} );

const getPlanJetpackSecurityT2Details = (): IncompleteJetpackPlan => ( {
	...getPlanJetpackSecurityT1Details(),
	type: TYPE_SECURITY_T2,
	getIncludedFeatures: () => [
		FEATURE_JETPACK_BACKUP_T2_YEARLY,
		FEATURE_JETPACK_BACKUP_T2_MONTHLY,
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
		FEATURE_PREMIUM_SUPPORT,
		WPCOM_FEATURES_SCAN,
		WPCOM_FEATURES_ANTISPAM,
		WPCOM_FEATURES_BACKUPS,
	],
	getInferiorFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
	],
} );

const getPlanJetpackCompleteDetails = (): IncompleteJetpackPlan => ( {
	...getJetpackCommonPlanDetails(),
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
			'Get the full power of Jetpack with all Security, Performance, Growth, and Design tools.'
		),
	getFeaturedDescription: () =>
		translate(
			'Get the full Jetpack suite with real-time security tools, improved site performance, and tools to grow your business.'
		),
	getLightboxDescription: () =>
		translate(
			'Full Jetpack suite with real-time security, instant site search, ad-free video, all CRM extensions, and extra storage for backups and video.'
		),
	getTagline: () => translate( 'For best-in-class WordPress sites' ),
	getPlanCardFeatures: () => [
		FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
		FEATURE_JETPACK_1TB_BACKUP_STORAGE,
		FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
		FEATURE_PRODUCT_SEARCH_V2,
		FEATURE_CRM_V2,
	],
	getIncludedFeatures: () =>
		compact( [
			FEATURE_JETPACK_BACKUP_T2_YEARLY,
			FEATURE_JETPACK_BACKUP_T2_MONTHLY,
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
			FEATURE_JETPACK_VIDEOPRESS,
			FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
			FEATURE_REPUBLICIZE,
			FEATURE_ADVANCED_SEO,
			FEATURE_SEO_PREVIEW_TOOLS,
			FEATURE_SIMPLE_PAYMENTS,
			FEATURE_WORDADS_INSTANT,
			FEATURE_GOOGLE_ANALYTICS,
			isEnabled( 'themes/premium' ) ? FEATURE_PREMIUM_THEMES : null,
			FEATURE_PREMIUM_SUPPORT,
			WPCOM_FEATURES_SCAN,
			WPCOM_FEATURES_ANTISPAM,
			WPCOM_FEATURES_BACKUPS,
		] ),
	getInferiorFeatures: () => [
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_BACKUP_ARCHIVE_30,
	],
	getBenefits: () => [
		translate( 'Protect your revenue stream and content' ),
		translate( 'Learn about issues before your customers are impacted' ),
		translate( 'Restore your site in one click from desktop or mobile' ),
		translate( 'Fix your site without a developer' ),
		translate( 'Protect Woo order and customer data' ),
		translate( 'Save time manually reviewing spam' ),
		translate( 'Grow your business with video, social, and CRM tools' ),
		translate( 'Best-in-class support from WordPress experts' ),
	],
} );

// DO NOT import. Use `getPlan` instead.
export const PLANS_LIST: Record< string, Plan | JetpackPlan | WPComPlan > = {
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
		getIncludedFeatures: () => [],
		getInferiorFeatures: () => [],
		getCancellationFeatureList: (): CancellationFeatureList => ( {
			monthly: [
				cancellationFeatureListTerms.MANAGED_HOSTINGS,
				cancellationFeatureListTerms.SEO_AND_SOCIAL,
				cancellationFeatureListTerms.EARN_AD_REVENUE,
				cancellationFeatureListTerms.SECURITY_AND_SPAM,
				cancellationFeatureListTerms.JETPACK_ESSENTIALS,
				cancellationFeatureListTerms.AND_MORE,
			],
			yearly: [
				cancellationFeatureListTerms.MANAGED_HOSTINGS,
				cancellationFeatureListTerms.SEO_AND_SOCIAL,
				cancellationFeatureListTerms.EARN_AD_REVENUE,
				cancellationFeatureListTerms.SECURITY_AND_SPAM,
				cancellationFeatureListTerms.JETPACK_ESSENTIALS,
				cancellationFeatureListTerms.AND_MORE,
			],
			withDomain: [
				cancellationFeatureListTerms.MANAGED_HOSTINGS,
				cancellationFeatureListTerms.SEO_AND_SOCIAL,
				cancellationFeatureListTerms.EARN_AD_REVENUE,
				cancellationFeatureListTerms.SECURITY_AND_SPAM,
				cancellationFeatureListTerms.AND_MORE,
			],
		} ),
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
				PLAN_WPCOM_STARTER,
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
				PLAN_WPCOM_PRO_MONTHLY,
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
				PLAN_WPCOM_STARTER,
				PLAN_WPCOM_PRO,
				PLAN_BLOGGER,
				PLAN_BLOGGER_2_YEARS,
				PLAN_PERSONAL_MONTHLY,
				PLAN_PERSONAL,
				PLAN_PERSONAL_2_YEARS,
				PLAN_PREMIUM_MONTHLY,
				PLAN_PREMIUM,
				PLAN_PREMIUM_2_YEARS,
				PLAN_BUSINESS_MONTHLY,
				PLAN_WPCOM_PRO_MONTHLY,
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
				PLAN_WPCOM_STARTER,
				PLAN_WPCOM_PRO,
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
				PLAN_WPCOM_PRO_MONTHLY,
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
				PLAN_WPCOM_PRO_MONTHLY,
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
				PLAN_WPCOM_STARTER,
				PLAN_WPCOM_PRO,
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
				PLAN_WPCOM_PRO_MONTHLY,
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
				PLAN_WPCOM_STARTER,
				PLAN_WPCOM_PRO,
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
				PLAN_WPCOM_PRO_MONTHLY,
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
					FEATURE_JETPACK_BACKUP_T1_YEARLY,
					FEATURE_JETPACK_BACKUP_T1_MONTHLY,
					FEATURE_JETPACK_BACKUP_T2_YEARLY,
					FEATURE_JETPACK_BACKUP_T2_MONTHLY,
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
		getIncludedFeatures: () => [
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
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '1TB (1,000GB) of cloud storage' ),
			translate( '1-year activity log archive' ),
			translate( 'Unlimited one-click restores from the last 1 year' ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (60k API calls/mo)' ),
			translate( 'VideoPress: 1TB of ad-free video hosting' ),
			translate( 'Boost: Automatic CSS generation' ),
			translate( 'Site Search: Up to 100k records' ),
			translate( 'Social: Basic with 1,000 shares/mo' ),
			translate( 'CRM: Entrepreneur with 30 extensions' ),
		],
	},

	[ PLAN_JETPACK_COMPLETE_MONTHLY ]: {
		...getPlanJetpackCompleteDetails(),
		...getMonthlyTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_COMPLETE_MONTHLY,
		getPathSlug: () => 'complete-monthly',
		getProductId: () => 2015,
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '1TB (1,000GB) of cloud storage' ),
			translate( '1-year activity log archive' ),
			translate( 'Unlimited one-click restores from the last 1-year' ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (60k API calls/mo)' ),
			translate( 'VideoPress: 1TB of ad-free video hosting' ),
			translate( 'Boost: Automatic CSS generation' ),
			translate( 'Site Search: Up to 100k records' ),
			translate( 'Social: Basic with 1,000 shares/mo' ),
			translate( 'CRM: Entrepreneur with 30 extensions' ),
		],
	},

	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: {
		...getPlanJetpackSecurityT1Details(),
		...getAnnualTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_SECURITY_T1_YEARLY,
		getPathSlug: () => 'security-20gb-yearly',
		getProductId: () => 2016,
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '10GB of cloud storage' ),
			translate( '30-day activity log archive' ),
			translate( 'Unlimited one-click restores from the last 30 days' ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (10k API calls/mo)' ),
		],
	},

	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: {
		...getPlanJetpackSecurityT1Details(),
		...getMonthlyTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_SECURITY_T1_MONTHLY,
		getPathSlug: () => 'security-20gb-monthly',
		getProductId: () => 2017,
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '10GB of cloud storage' ),
			translate( '30-day activity log archive' ),
			translate( 'Unlimited one-click restores from the last 30 days' ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (10k API calls/mo)' ),
		],
	},

	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: {
		...getPlanJetpackSecurityT2Details(),
		...getAnnualTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_SECURITY_T2_YEARLY,
		getPathSlug: () => 'security-1tb-yearly',
		getProductId: () => 2019,
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '{{strong}}1TB (1,000GB){{/strong}} of cloud storage', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( '{{strong}}1-year{{/strong}} activity log archive', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( 'Unlimited one-click restores from the last {{strong}}1 year{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (10k API calls/mo)' ),
		],
	},

	[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: {
		...getPlanJetpackSecurityT2Details(),
		...getMonthlyTimeframe(),
		getStoreSlug: () => PLAN_JETPACK_SECURITY_T2_MONTHLY,
		getPathSlug: () => 'security-1tb-monthly',
		getProductId: () => 2020,
		getWhatIsIncluded: () => [
			translate( 'VaultPress Backup: Real-time backups as you edit' ),
			translate( '{{strong}}1TB (1,000GB){{/strong}} of cloud storage', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( '{{strong}}1-year{{/strong}} activity log archive', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( 'Unlimited one-click restores from the last {{strong}}1 year{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
			translate( 'Scan: Real-time malware scanning and one-click fixes' ),
			translate( 'Akismet: Comment and form spam protection (10k API calls/mo)' ),
		],
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
		getIncludedFeatures: () => [
			FEATURE_AUDIO_UPLOADS,
			FEATURE_JETPACK_SEARCH,
			FEATURE_JETPACK_SEARCH_MONTHLY,
		],
		getInferiorFeatures: () => [],

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

// Brand new WPCOM plans
PLANS_LIST[ PLAN_WPCOM_STARTER ] = {
	...getDotcomPlanDetails(),
	group: GROUP_WPCOM,
	type: TYPE_STARTER,
	term: TERM_ANNUALLY,
	getTitle: () => i18n.translate( 'WordPress Starter' ),
	getProductId: () => 1033,
	getStoreSlug: () => PLAN_WPCOM_STARTER,
	getPathSlug: () => 'starter',
	getDescription: () =>
		i18n.hasTranslation( 'Start with a custom domain name, simple payments, and extra storage.' ) ||
		[ 'en', 'en-gb' ].includes( getLocaleSlug() || '' )
			? i18n.translate( 'Start with a custom domain name, simple payments, and extra storage.' )
			: i18n.translate( 'Start your WordPress.com website. Limited functionality and storage.' ),
	getSubTitle: () => i18n.translate( 'Essential features. Freedom to grow.' ),
	getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' ),
	getPlanCompareFeatures: () => [
		FEATURE_UNLIMITED_TRAFFIC,
		FEATURE_MANAGED_HOSTING,
		FEATURE_FREE_THEMES,
		FEATURE_CUSTOM_DOMAIN,
		FEATURE_UNLIMITED_ADMINS,
		FEATURE_6GB_STORAGE,
		FEATURE_GOOGLE_ANALYTICS,
		FEATURE_PAYMENT_BLOCKS,
		FEATURE_TITAN_EMAIL,
	],
	getIncludedFeatures: () => [ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS ],
	getCancellationFeatureList: (): CancellationFeatureList => ( {
		monthly: [
			cancellationFeatureListTerms.MANAGED_HOSTINGS,
			cancellationFeatureListTerms.SEO_AND_SOCIAL,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.SECURITY_AND_SPAM,
			cancellationFeatureListTerms.JETPACK_ESSENTIALS,
			cancellationFeatureListTerms.AND_MORE,
		],
		yearly: [
			cancellationFeatureListTerms.MANAGED_HOSTINGS,
			cancellationFeatureListTerms.SEO_AND_SOCIAL,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.SECURITY_AND_SPAM,
			cancellationFeatureListTerms.JETPACK_ESSENTIALS,
			cancellationFeatureListTerms.AND_MORE,
		],
		withDomain: [
			cancellationFeatureListTerms.MANAGED_HOSTINGS,
			cancellationFeatureListTerms.SEO_AND_SOCIAL,
			cancellationFeatureListTerms.EARN_AD_REVENUE,
			cancellationFeatureListTerms.SECURITY_AND_SPAM,
			cancellationFeatureListTerms.AND_MORE,
		],
	} ),
};

PLANS_LIST[ PLAN_WPCOM_FLEXIBLE ] = {
	// Inherits the free plan
	...PLANS_LIST[ PLAN_FREE ],
	group: GROUP_WPCOM,
	type: TYPE_FLEXIBLE,
	getTitle: () => i18n.translate( 'WordPress Free' ),
	getBillingTimeFrame: () => i18n.translate( 'upgrade when you need' ),
	getDescription: () =>
		i18n.translate( 'Start your free WordPress.com website. Limited functionality and storage.' ),
	getPlanCompareFeatures: () => [ FEATURE_1GB_STORAGE ],
};

PLANS_LIST[ PLAN_WPCOM_PRO ] = {
	...getPlanProDetails(),
	term: TERM_ANNUALLY,
	getProductId: () => 1032,
	getStoreSlug: () => PLAN_WPCOM_PRO,
	getPathSlug: () => 'pro',
	getBillingTimeFrame: () => i18n.translate( 'per month, billed yearly' ),
};

PLANS_LIST[ PLAN_WPCOM_PRO_MONTHLY ] = {
	...getPlanProDetails(),
	...getMonthlyTimeframe(),
	availableFor: ( plan ) => [ PLAN_FREE ].includes( plan ),
	getProductId: () => 1034,
	getStoreSlug: () => PLAN_WPCOM_PRO_MONTHLY,
	getPathSlug: () => 'pro-monthly',
};
