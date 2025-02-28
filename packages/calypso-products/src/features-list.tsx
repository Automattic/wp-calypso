import { isEnabled } from '@automattic/calypso-config';
import { MaterialIcon, ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from '@automattic/urls';
import i18n from 'i18n-calypso';
import { MemoExoticComponent } from 'react';
import Theme2Image from './assets/images/theme-2.jpg';
import {
	FEATURE_SPAM_10K_PER_MONTH,
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
	FEATURE_AKISMET_V2,
	FEATURE_ALL_BUSINESS_FEATURES,
	FEATURE_ALL_FREE_FEATURES,
	FEATURE_ALL_FREE_FEATURES_JETPACK,
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
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
	FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
	FEATURE_CRM_LEADS_AND_FUNNEL,
	FEATURE_CRM_NO_CONTACT_LIMITS,
	FEATURE_CRM_PROPOSALS_AND_INVOICES,
	FEATURE_CRM_TRACK_TRANSACTIONS,
	FEATURE_CRM_V2,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_EARN_AD,
	FEATURE_EASY_SITE_MIGRATION,
	FEATURE_ECOMMERCE_MARKETING,
	FEATURE_FILTERING_V2,
	FEATURE_FREE_BLOG_DOMAIN,
	FEATURE_FREE_DOMAIN,
	FEATURE_FREE_THEMES,
	FEATURE_FREE_THEMES_SIGNUP,
	FEATURE_FREE_WORDPRESS_THEMES,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_GOOGLE_ANALYTICS_V3,
	FEATURE_GOOGLE_MY_BUSINESS,
	FEATURE_HOSTING,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_INSTANT_EMAIL_V2,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_JETPACK_VIDEOPRESS_EDITOR,
	FEATURE_JETPACK_VIDEOPRESS_STORAGE,
	FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
	FEATURE_LANGUAGE_SUPPORT_V2,
	FEATURE_MALWARE_SCANNING_DAILY,
	FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
	FEATURE_MANAGE,
	FEATURE_MEMBERSHIPS,
	FEATURE_MONETISE,
	FEATURE_NO_ADS,
	FEATURE_NO_BRANDING,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
	FEATURE_ONE_CLICK_FIX_V2,
	FEATURE_ONE_CLICK_RESTORE_V2,
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
	FEATURE_PRODUCT_BACKUP_DAILY_V2,
	FEATURE_PRODUCT_BACKUP_REALTIME_V2,
	FEATURE_PRODUCT_SCAN_DAILY_V2,
	FEATURE_PRODUCT_SCAN_REALTIME_V2,
	FEATURE_PRODUCT_SEARCH_V2,
	FEATURE_REPUBLICIZE,
	FEATURE_SCAN_V2,
	FEATURE_SEARCH_V2,
	FEATURE_SECURE_STORAGE_V2,
	FEATURE_SEO_PREVIEW_TOOLS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_SITE_STAGING_SITES,
	FEATURE_SITE_STATS,
	FEATURE_SPAM_AKISMET_PLUS,
	FEATURE_SPAM_BLOCK_V2,
	FEATURE_SPELLING_CORRECTION_V2,
	FEATURE_SUPPORTS_WOOCOMMERCE_V2,
	FEATURE_STANDARD_SECURITY_TOOLS,
	FEATURE_TRAFFIC_TOOLS,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_VIDEO_HOSTING_V2,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_WORDADS_INSTANT,
	FEATURE_WP_SUBDOMAIN,
	FEATURE_WP_SUBDOMAIN_SIGNUP,
	PREMIUM_DESIGN_FOR_STORES,
	FEATURE_JETPACK_1GB_BACKUP_STORAGE,
	FEATURE_JETPACK_10GB_BACKUP_STORAGE,
	FEATURE_JETPACK_1TB_BACKUP_STORAGE,
	FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
	FEATURE_JETPACK_PRODUCT_BACKUP,
	FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
	FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
	FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
	FEATURE_UNLIMITED_USERS,
	FEATURE_UNLIMITED_POSTS_PAGES,
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_TITAN_EMAIL,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_ADDITIONAL_SITES,
	FEATURE_WOOCOMMERCE,
	FEATURE_UNLIMITED_EMAILS,
	FEATURE_UNLIMITED_SUBSCRIBERS,
	FEATURE_IMPORT_SUBSCRIBERS,
	FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
	FEATURE_POST_BY_EMAIL,
	FEATURE_REAL_TIME_ANALYTICS,
	FEATURE_GOOGLE_ANALYTICS_V2,
	FEATURE_ADD_UNLIMITED_LINKS,
	FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
	FEATURE_TRACK_VIEWS_CLICKS,
	FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
	FEATURE_UNLIMITED_TRAFFIC,
	FEATURE_MANAGED_HOSTING,
	FEATURE_THE_READER,
	WPCOM_FEATURES_NO_ADVERTS,
	FEATURE_BEAUTIFUL_THEMES,
	FEATURE_PAGES,
	FEATURE_USERS,
	FEATURE_NEWSLETTERS_RSS,
	FEATURE_POST_EDITS_HISTORY,
	FEATURE_SECURITY_BRUTE_FORCE,
	FEATURE_SMART_REDIRECTS,
	FEATURE_ALWAYS_ONLINE,
	FEATURE_FAST_DNS,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_DESIGN_TOOLS,
	FEATURE_PREMIUM_THEMES,
	FEATURE_WORDADS,
	FEATURE_PLUGINS_THEMES,
	FEATURE_BANDWIDTH,
	FEATURE_BURST,
	FEATURE_WAF_V2,
	FEATURE_CDN,
	FEATURE_CPUS,
	FEATURE_DATACENTRE_FAILOVER,
	FEATURE_ISOLATED_INFRA,
	FEATURE_SECURITY_MALWARE,
	FEATURE_SECURITY_DDOS,
	FEATURE_DEV_TOOLS,
	FEATURE_WP_UPDATES,
	FEATURE_MULTI_SITE,
	FEATURE_SELL_SHIP,
	FEATURE_SELL_INTERNATIONALLY,
	FEATURE_AUTOMATIC_SALES_TAX,
	FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
	FEATURE_INTEGRATED_SHIPMENT_TRACKING,
	FEATURE_SELL_EGIFTS_AND_VOUCHERS,
	FEATURE_EMAIL_MARKETING,
	FEATURE_MARKETPLACE_SYNC_SOCIAL_MEDIA_INTEGRATION,
	FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
	FEATURE_MARKETING_AUTOMATION,
	FEATURE_CUSTOM_STORE,
	FEATURE_INVENTORY,
	FEATURE_CHECKOUT,
	FEATURE_ACCEPT_PAYMENTS_V2,
	FEATURE_SALES_REPORTS,
	FEATURE_EXTENSIONS,
	FEATURE_STATS_JP,
	FEATURE_SPAM_JP,
	FEATURE_LTD_SOCIAL_MEDIA_JP,
	FEATURE_SHARES_SOCIAL_MEDIA_JP,
	FEATURE_CONTACT_FORM_JP,
	FEATURE_PAID_SUBSCRIBERS_JP,
	FEATURE_VIDEOPRESS_JP,
	FEATURE_UNLTD_SOCIAL_MEDIA_JP,
	FEATURE_SEO_JP,
	FEATURE_BRUTE_PROTECT_JP,
	FEATURE_REALTIME_BACKUPS_JP,
	FEATURE_UPTIME_MONITOR_JP,
	FEATURE_ES_SEARCH_JP,
	FEATURE_PLUGIN_AUTOUPDATE_JP,
	FEATURE_PREMIUM_CONTENT_JP,
	FEATURE_SITE_ACTIVITY_LOG_JP,
	FEATURE_DONATIONS_AND_TIPS_JP,
	FEATURE_PAYPAL_JP,
	FEATURE_PAYMENT_BUTTONS_JP,
	FEATURE_GLOBAL_EDGE_CACHING,
	FEATURE_AUTOMATED_EMAIL_TRIGGERS,
	FEATURE_CART_ABANDONMENT_EMAILS,
	FEATURE_REFERRAL_PROGRAMS,
	FEATURE_CUSTOMER_BIRTHDAY_EMAILS,
	FEATURE_LOYALTY_POINTS_PROGRAMS,
	FEATURE_OFFER_BULK_DISCOUNTS,
	FEATURE_RECOMMEND_ADD_ONS,
	FEATURE_ASSEMBLED_PRODUCTS_AND_KITS,
	FEATURE_MIN_MAX_ORDER_QUANTITY,
	FEATURE_WOOCOMMERCE_STORE,
	FEATURE_WOOCOMMERCE_MOBILE_APP,
	FEATURE_WORDPRESS_CMS,
	FEATURE_WORDPRESS_MOBILE_APP,
	FEATURE_FREE_SSL_CERTIFICATE,
	FEATURE_LIST_UNLIMITED_PRODUCTS,
	FEATURE_GIFT_CARDS,
	FEATURE_PRODUCT_BUNDLES,
	FEATURE_CUSTOM_PRODUCT_KITS,
	FEATURE_LIST_PRODUCTS_BY_BRAND,
	FEATURE_PRODUCT_RECOMMENDATIONS,
	FEATURE_INTEGRATED_PAYMENTS,
	FEATURE_INTERNATIONAL_PAYMENTS,
	FEATURE_AUTOMATED_SALES_TAXES,
	FEATURE_ACCEPT_LOCAL_PAYMENTS,
	FEATURE_RECURRING_PAYMENTS,
	FEATURE_PROMOTE_ON_TIKTOK,
	FEATURE_SYNC_WITH_PINTEREST,
	FEATURE_CONNECT_WITH_FACEBOOK,
	FEATURE_ABANDONED_CART_RECOVERY,
	FEATURE_ADVERTISE_ON_GOOGLE,
	FEATURE_CUSTOM_ORDER_EMAILS,
	FEATURE_LIVE_SHIPPING_RATES,
	FEATURE_DISCOUNTED_SHIPPING,
	FEATURE_PRINT_SHIPPING_LABELS,
	FEATURE_NEWSLETTER_IMPORT_SUBSCRIBERS_FREE,
	FEATURE_PAYMENT_TRANSACTION_FEES_10,
	FEATURE_PAYMENT_TRANSACTION_FEES_8,
	FEATURE_PAYMENT_TRANSACTION_FEES_4,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	FEATURE_PAYMENT_TRANSACTION_FEES_0,
	FEATURE_PAYMENT_TRANSACTION_FEES_0_WOO,
	FEATURE_PAYMENT_TRANSACTION_FEES_0_ALL,
	FEATURE_PAYMENT_TRANSACTION_FEES_2_REGULAR,
	FEATURE_PREMIUM_STORE_THEMES,
	FEATURE_STORE_DESIGN,
	FEATURE_UNLIMITED_PRODUCTS,
	FEATURE_DISPLAY_PRODUCTS_BRAND,
	FEATURE_PRODUCT_ADD_ONS,
	FEATURE_ASSEMBLED_KITS,
	FEATURE_STOCK_NOTIFS,
	FEATURE_DYNAMIC_UPSELLS,
	FEATURE_CUSTOM_MARKETING_AUTOMATION,
	FEATURE_BULK_DISCOUNTS,
	FEATURE_INVENTORY_MGMT,
	FEATURE_STREAMLINED_CHECKOUT,
	FEATURE_SELL_60_COUNTRIES,
	FEATURE_SHIPPING_INTEGRATIONS,
	FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION,
	FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	FEATURE_COMMISSION_FEE_STANDARD_FEATURES,
	FEATURE_COMMISSION_FEE_WOO_FEATURES,
	FEATURE_STATS_PAID,
	FEATURE_STATS_COMMERCIAL,
	FEATURE_SENSEI_SUPPORT,
	FEATURE_SENSEI_UNLIMITED,
	FEATURE_SENSEI_INTERACTIVE,
	FEATURE_SENSEI_QUIZZES,
	FEATURE_SENSEI_SELL_COURSES,
	FEATURE_SENSEI_STORAGE,
	FEATURE_SENSEI_HOSTING,
	FEATURE_SENSEI_JETPACK,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	EXPERT_SUPPORT_ALL_DAYS,
	FEATURE_TIERED_STORAGE_PLANS_AVAILABLE,
	FEATURE_REAL_TIME_SECURITY_SCANS,
	FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING,
	FEATURE_SECURITY_VULNERABILITY_NOTIFICATIONS,
	FEATURE_WOOCOMMERCE_HOSTING,
	FEATURE_FAST_SUPPORT_FROM_EXPERTS,
	FEATURE_PRIORITY_24_7_SUPPORT,
	FEATURE_SOCIAL_AUTO_SHARE,
	FEATURE_SOCIAL_SHARES_1000,
	FEATURE_SOCIAL_ENHANCED_PUBLISHING,
	FEATURE_SOCIAL_IMAGE_GENERATOR,
	FEATURE_THEMES_PREMIUM_AND_STORE,
	FEATURE_UNLIMITED_ENTITIES,
	FEATURE_WOO_THEMES,
	FEATURE_WOO_SOCIAL_MEDIA_INTEGRATIONS,
	FEATURE_GOOGLE_LISTING_ADS,
	FEATURE_WOO_PAYMENTS,
	FEATURE_WOO_SHIPPING_TRACKING,
	FEATURE_WOO_TAX_SOLUTIONS,
	FEATURE_WOO_BRANDS,
	FEATURE_WOO_AUTOMATE,
	FEATURE_CONNECT_ANALYTICS,
	FEATURE_LIMITED_SITE_ACTIVITY_LOG,
	FEATURE_BIG_SKY_WEBSITE_BUILDER,
	FEATURE_BIG_SKY_WEBSITE_BUILDER_CHECKOUT,
	FEATURE_UPLOAD_VIDEO,
	FEATURE_STATS_BASIC_20250206,
	FEATURE_STATS_ADVANCED_20250206,
	FEATURE_SUPPORT,
} from './constants';
import type { FeatureList } from './types';

const getTransactionFeeCopy = ( commission = 0, variation = '' ) => {
	switch ( variation ) {
		case 'woo':
			return i18n.translate(
				'%(commission)d%% transaction fee for standard WooCommerce payments {{br}}{{/br}}(+ standard processing fee)',
				{
					components: { br: <br /> },
					args: { commission },
				}
			);

		case 'all':
			return i18n.translate(
				'%(commission)d%% transaction fee for all payment features {{br}}{{/br}}(+ standard processing fee)',
				{
					components: { br: <br /> },
					args: { commission },
				}
			);

		case 'regular':
			return i18n.translate(
				'%(commission)d%% transaction fee for standard payments {{br}}{{/br}}(+ standard processing fee)',
				{
					components: { br: <br /> },
					args: { commission },
				}
			);

		default:
			return i18n.translate(
				'%(commission)d%% transaction fee for payments {{br}}{{/br}}(+ standard processing fee)',
				{
					components: { br: <br /> },
					args: { commission },
				}
			);
	}
};

const FEATURES_LIST: FeatureList = {
	[ FEATURE_BLANK ]: {
		getSlug: () => FEATURE_BLANK,
		getTitle: () => '',
	},

	[ FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All free features{{/a}}', {
				components: {
					a: <ExternalLink href="https://jetpack.com/features/comparison" target="_blank" />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES,
		getTitle: () => i18n.translate( 'All free features' ),
		getDescription: () => i18n.translate( 'Also includes all features offered in the free plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Personal features{{/a}}', {
				components: {
					a: <ExternalLink href="https://jetpack.com/features/comparison" target="_blank" />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Personal plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => i18n.translate( 'All Personal features' ),
		getDescription: () =>
			i18n.translate(
				'Including email and live chat support, an ad-free experience for your visitors, increased storage space, and a custom domain name for one year.'
			),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		getTitle: () =>
			i18n.translate( '{{a}}All Premium features{{/a}}', {
				components: {
					a: <ExternalLink href="https://jetpack.com/features/comparison" target="_blank" />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Also includes all features offered in the Premium plan.' ),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => i18n.translate( 'All Premium features' ),
		getDescription: () => {
			return isEnabled( 'themes/premium' )
				? i18n.translate(
						'Including premium themes, advanced design and monetization options, Pay with PayPal buttons, and a custom domain name for one year.'
				  )
				: i18n.translate(
						'Including advanced design and monetization options, Pay with PayPal buttons, and a custom domain name for one year.'
				  );
		},
	},

	[ FEATURE_ADVANCED_DESIGN_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Advanced design customization' ),
		getDescription: () =>
			i18n.translate(
				'Access extended color schemes, backgrounds, and CSS, giving you complete control over how your site looks.'
			),
	},

	[ FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_BLOG_DOMAIN,
		getTitle: () => i18n.translate( 'Free .blog domain for one year' ),
		getDescription: () =>
			i18n.translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			),
	},

	[ FEATURE_FREE_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_DOMAIN,
		getTitle: () => i18n.translate( 'Free domain for one year' ),
		getDescription: () =>
			i18n.translate(
				'All paid WordPress.com plans purchased for an annual term include one year of free domain registration. ' +
					'Domains registered through this promotion will renew at our {{a}}standard rate{{/a}}, plus applicable taxes, after the first year.{{br /}}{{br /}}' +
					'This offer is redeemable one time only, and does not apply to plan upgrades, renewals, or premium domains.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl( DOMAIN_PRICING_AND_AVAILABLE_TLDS ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						br: <br />,
					},
				}
			),
	},

	[ FEATURE_HOSTING ]: {
		getSlug: () => FEATURE_HOSTING,
		getTitle: () => i18n.translate( 'Best-in-class hosting' ),
		getDescription: () =>
			i18n.translate(
				'Site hosting is included with your plan, eliminating additional cost and technical hassle.'
			),
	},

	[ FEATURE_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_THEMES,
		getTitle: () => i18n.translate( 'Premium themes' ),
		getIcon: () => <img src={ Theme2Image } alt={ i18n.translate( 'Premium themes' ) } />,
		getDescription: () => i18n.translate( 'Switch between a collection of premium design themes.' ),
	},

	[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ]: {
		getSlug: () => WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
		getTitle: () => i18n.translate( 'All premium themes' ),
		getDescription: () => {
			return i18n.translate( 'Switch between all of our premium design themes.' );
		},
	},
	[ WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ]: {
		getSlug: () => WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
		getTitle: () => i18n.translate( 'Dozens of premium themes' ),
		getDescription: () => i18n.translate( 'Switch between a collection of premium design themes.' ),
	},
	[ FEATURE_THEMES_PREMIUM_AND_STORE ]: {
		getSlug: () => FEATURE_THEMES_PREMIUM_AND_STORE,
		getTitle: () => i18n.translate( 'All premium and store themes' ),
		getDescription: () => i18n.translate( 'Switch between all of our themes.' ),
	},

	[ FEATURE_MONETISE ]: {
		getSlug: () => FEATURE_MONETISE,
		getTitle: () => i18n.translate( 'Monetize your site with ads' ),
		getDescription: () =>
			i18n.translate(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ FEATURE_EARN_AD ]: {
		getSlug: () => FEATURE_EARN_AD,
		getTitle: () => i18n.translate( 'Earn ad revenue' ),
	},

	[ FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => i18n.translate( 'Upload themes and plugins' ),
		getDescription: () => i18n.translate( 'Upload custom themes and plugins on your site.' ),
	},

	[ FEATURE_CLOUDFLARE_ANALYTICS ]: {
		getSlug: () => FEATURE_CLOUDFLARE_ANALYTICS,
		getTitle: () => i18n.translate( 'Cloudflare Web Analytics' ),
	},

	[ FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
		getDescription: () =>
			i18n.translate(
				"Access to a wide range of professional themes so you can find a design that's just right for your site."
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
	[ FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => i18n.translate( 'Advanced SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_ADVANCED_SEO_EXPANDED_ABBR ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		getTitle: () => i18n.translate( 'Advanced SEO (Search Engine Optimisation) tools' ),
	},
	[ FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => i18n.translate( 'Free WordPress Themes' ),
	},
	[ FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => i18n.translate( 'Google Analytics integration' ),
		getDescription: () =>
			i18n.translate(
				"Track your site's stats with Google Analytics for a " +
					'deeper understanding of your visitors and customers.'
			),
	},

	[ FEATURE_GOOGLE_MY_BUSINESS ]: {
		getSlug: () => FEATURE_GOOGLE_MY_BUSINESS,
		getTitle: () => i18n.translate( 'Google Business Profile' ),
		getDescription: () =>
			i18n.translate(
				'See how customers find you on Google -- and whether they visited your site ' +
					'and looked for more info on your business -- by connecting to a Google Business Profile location.'
			),
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}200 GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
		getStoreSlug: () => 'unlimited_space',
	},

	[ FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_BLOG_DOMAIN,
		getTitle: () =>
			i18n.translate( 'Free .blog Domain for one year', {
				context: 'title',
			} ),
		getDescription: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			);
		},
	},

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => FEATURE_CUSTOM_DOMAIN,
		getTitle: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return i18n.translate( '%(domainName)s is included', {
					args: { domainName },
				} );
			}

			return i18n.translate( 'Free domain for one year', {
				context: 'title',
			} );
		},
		getAlternativeTitle: () => i18n.translate( 'Free custom domain' ),
		getDescription: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return i18n.translate( 'Your domain (%s) is included with this plan.', {
					args: domainName,
				} );
			}

			return i18n.translate(
				'Get a custom domain – like {{i}}yourgroovydomain.com{{/i}} – free for the first year.',
				{
					components: {
						i: <i />,
					},
				}
			);
		},
	},

	[ FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => i18n.translate( 'Jetpack essential features' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your site for better SEO, faster-loading pages, and protection from spam.'
			),
	},

	[ FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => FEATURE_JETPACK_ADVANCED,
		getTitle: () => i18n.translate( 'Jetpack advanced features' ),
		getHeader: () => i18n.translate( 'Jetpack advanced' ),
		getDescription: () =>
			i18n.translate(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site and restore your site ' +
					'to a previous point in time with just a click! While you’re at it, ' +
					'improve your SEO with our Advanced SEO tools and automate social media sharing.'
			),
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => i18n.translate( 'VideoPress support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},
	[ FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PREMIUM,
		getTitle: () => i18n.translate( 'VideoPress support' ),
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
			i18n.translate( '{{strong}}Unlimited{{/strong}} Video hosting', {
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
		getTitle: () => i18n.translate( 'Audio upload support' ),
		getDescription: () =>
			i18n.translate(
				'The easiest way to upload audio files that use any major audio file format. '
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_NO_ADS ]: {
		getSlug: () => WPCOM_FEATURES_NO_ADVERTS,
		getTitle: () => i18n.translate( 'Remove WordPress.com ads' ),
		getDescription: () =>
			i18n.translate(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ FEATURE_REPUBLICIZE ]: {
		getSlug: () => FEATURE_REPUBLICIZE,
		getTitle: () => i18n.translate( 'Advanced social media' ),
		getDescription: () =>
			i18n.translate(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => i18n.translate( 'Pay with PayPal' ),
		getDescription: () => i18n.translate( 'Sell anything with a simple PayPal button.' ),
	},
	[ FEATURE_NO_BRANDING ]: {
		getSlug: () => FEATURE_NO_BRANDING,
		getTitle: () => i18n.translate( 'Remove WordPress.com branding' ),
		getDescription: () =>
			i18n.translate(
				"Keep the focus on your site's brand by removing the WordPress.com footer branding."
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ FEATURE_ADVANCED_SEO ]: {
		getSlug: () => FEATURE_ADVANCED_SEO,
		getTitle: () => i18n.translate( 'SEO tools' ),
		getDescription: () =>
			i18n.translate(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_PLUGINS,
		getTitle: () => i18n.translate( 'Install plugins' ),
		getDescription: () =>
			i18n.translate(
				'Plugins extend the functionality of your site and ' +
					'open up endless possibilities for presenting your content and interacting with visitors.'
			),
	},

	[ FEATURE_INSTALL_PLUGINS ]: {
		getSlug: () => FEATURE_INSTALL_PLUGINS,
		getTitle: () =>
			i18n.translate(
				'Access to more than 50,000 WordPress plugins to extend functionality for your site'
			),
	},

	[ FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES,
		getTitle: () => i18n.translate( 'Install themes' ),
		getDescription: () =>
			i18n.translate(
				'With the option to upload themes, you can give your site a professional polish ' +
					'that will help it stand out among the rest.'
			),
	},

	[ FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => FEATURE_WORDADS_INSTANT,
		getTitle: () => i18n.translate( 'Site monetization' ),
		getDescription: () =>
			i18n.translate(
				'Earn money on your site by displaying ads and collecting payments or donations.'
			),
	},

	[ FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN,
		getTitle: () => i18n.translate( 'WordPress.com subdomain' ),
		getDescription: () =>
			i18n.translate(
				'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).'
			),
	},

	[ FEATURE_FREE_THEMES ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => i18n.translate( 'Dozens of free themes' ),
		getDescription: () =>
			i18n.translate(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},

	[ FEATURE_1GB_STORAGE ]: {
		getSlug: () => FEATURE_1GB_STORAGE,
		getTitle: () => i18n.translate( '1GB' ),
		getCompareTitle: () => i18n.translate( '1 GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_3GB_STORAGE ]: {
		getSlug: () => FEATURE_3GB_STORAGE,
		getTitle: () => i18n.translate( '3 GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_6GB_STORAGE ]: {
		getSlug: () => FEATURE_6GB_STORAGE,
		getCompareTitle: () => i18n.translate( '6 GB' ),
		getTitle: () => i18n.translate( '6 GB' ),
		getDescription: () =>
			i18n.translate( 'Upload more images, audio, and documents to your website.' ),
	},

	[ FEATURE_13GB_STORAGE ]: {
		getSlug: () => FEATURE_13GB_STORAGE,
		getTitle: () => i18n.translate( '13 GB' ),
		getCompareTitle: () => i18n.translate( '13 GB' ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_50GB_STORAGE ]: {
		getSlug: () => FEATURE_50GB_STORAGE,
		getTitle: () => i18n.translate( '50 GB' ),
		getCompareTitle: () => i18n.translate( '50 GB' ),
		getDescription: () =>
			i18n.translate( 'Storage space for adding images and documents to your website.' ),
	},

	// TODO: Consider removing this because it is no longer standard on any plans
	[ FEATURE_200GB_STORAGE ]: {
		getSlug: () => FEATURE_200GB_STORAGE,
		getTitle: () => i18n.translate( '200 GB' ),
		getCompareTitle: () => i18n.translate( '200 GB' ),
		getDescription: () =>
			i18n.translate( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => i18n.translate( 'Community support' ),
		getDescription: () => i18n.translate( 'Get support through our ' + 'user community forums.' ),
	},

	[ FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => FEATURE_PREMIUM_SUPPORT,
		getTitle: () => i18n.translate( 'Priority Support' ),
		getDescription: () =>
			i18n.translate( 'Realtime help and guidance from professional WordPress experts.' ),
	},

	[ FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => i18n.translate( 'Standard security tools' ),
		getDescription: () =>
			i18n.translate(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ FEATURE_SITE_STATS ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => i18n.translate( 'Jetpack Stats' ),
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
		getTitle: () =>
			i18n.translate( '{{strong}}Daily{{/strong}} backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with ' +
					'unlimited, WordPress-optimized secure storage.'
			),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () =>
			i18n.translate( '{{strong}}Real-time{{/strong}} backups', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automatic real-time backups of every single aspect of your site. ' +
					'Stored safely and optimized for WordPress.'
			),
	},
	[ FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => i18n.translate( '30-day backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup archive' ),
		getDescription: () =>
			i18n.translate( 'Browse or restore any backup made since you activated the service.' ),
	},

	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited backup storage space' ),
		getDescription: () =>
			i18n.translate( 'Absolutely no limits on storage space for your backups.' ),
	},

	[ FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => FEATURE_AUTOMATED_RESTORES,
		getTitle: () => i18n.translate( 'Automated restores' ),
		getDescription: () =>
			i18n.translate( 'Restore your site from any available backup with a single click.' ),
	},
	[ FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => i18n.translate( 'Easy site migration' ),
		getDescription: () =>
			i18n.translate( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () =>
			i18n.translate( '{{strong}}Daily{{/strong}} malware scanning', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Comprehensive, automated scanning for security vulnerabilities or threats on your site.'
			),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => i18n.translate( 'Daily and on-demand malware scanning' ),
		getDescription: () =>
			i18n.translate(
				'Automated security scanning with the option to run complete site scans at any time.'
			),
	},
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => i18n.translate( 'One-click threat resolution' ),
		getDescription: () =>
			i18n.translate( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => FEATURE_AUTOMATIC_SECURITY_FIXES,
		getTitle: () =>
			i18n.translate( '{{strong}}Automatic{{/strong}} security fixes', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate(
				'Automated and immediate resolution for a large percentage of known security vulnerabilities or threats.'
			),
	},
	[ FEATURE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( 'Expanded site activity' ),
		getDescription: () =>
			i18n.translate(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ FEATURE_SITE_BACKUPS_AND_RESTORE ]: {
		getSlug: () => FEATURE_SITE_BACKUPS_AND_RESTORE,
		getTitle: () => i18n.translate( 'Automated site backups and one-click restore' ),
	},
	[ FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => i18n.translate( 'Accept payments in 60+ countries' ),
		getDescription: () =>
			i18n.translate(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => FEATURE_SHIPPING_CARRIERS,
		getTitle: () => i18n.translate( 'Integrations with top shipping carriers' ),
		getDescription: () =>
			i18n.translate(
				'Ship physical products in a snap and show live rates from shipping carriers like UPS and other shipping options.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},

	[ FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => i18n.translate( 'Unlimited products or services' ),
		getDescription: () =>
			i18n.translate(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => i18n.translate( 'eCommerce marketing tools' ),
		getDescription: () =>
			i18n.translate(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => i18n.translate( 'Premium customizable starter themes' ),
		getDescription: () =>
			i18n.translate(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => i18n.translate( 'All Business features' ),
		getDescription: () =>
			i18n.translate(
				'Including the ability to upload plugins and themes, priority support and advanced monetization options.'
			),
	},

	[ FEATURE_MEMBERSHIPS ]: {
		getSlug: () => FEATURE_MEMBERSHIPS,
		getTitle: () => i18n.translate( 'Payments' ),
		getDescription: () =>
			i18n.translate( 'Accept one-time, monthly, or annual payments on your website.' ),
	},

	[ FEATURE_PREMIUM_CONTENT_BLOCK ]: {
		getSlug: () => FEATURE_PREMIUM_CONTENT_BLOCK,
		getTitle: () => i18n.translate( 'Subscriber-only content' ),
		getDescription: () =>
			i18n.translate(
				'Create additional, premium content that you can make available to paying subscribers only.'
			),
	},

	[ FEATURE_PLAN_SECURITY_DAILY ]: {
		getSlug: () => FEATURE_PLAN_SECURITY_DAILY,
		getIcon: () => 'lock',
		getTitle: () => i18n.translate( 'All Security Daily features' ),
		isPlan: true,
	},
	[ FEATURE_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_BACKUP_DAILY_V2,
		getTitle: () => i18n.translate( 'Automated daily backups (off-site)' ),
	},

	[ FEATURE_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_BACKUP_REALTIME_V2,
		getTitle: () => i18n.translate( 'VaultPress Backup (real-time, off-site)' ),
	},
	[ FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_DAILY_V2,
		getIcon: () => 'cloud-upload',
		getTitle: () => i18n.translate( 'All VaultPress Backup Daily features' ),
		getDescription: () =>
			i18n.translate(
				'Automatic daily backups of your entire site, with unlimited, WordPress-optimized secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
	},

	[ FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_REALTIME_V2,
		getIcon: () => 'cloud-upload',
		getTitle: () => i18n.translate( 'VaultPress Backup Real-time (off-site)' ),
		getDescription: () =>
			i18n.translate(
				'Real-time backups of your entire site and database with unlimited secure storage. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/backup/" />,
					},
				}
			),
	},

	[ FEATURE_SCAN_V2 ]: {
		getSlug: () => FEATURE_SCAN_V2,
		getTitle: () => i18n.translate( 'Automated daily scanning' ),
	},

	// * Scan Daily *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_DAILY_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon as MemoExoticComponent< any > } ),
		getTitle: () => i18n.translate( 'Scan (daily, automated)' ),
		getDescription: () =>
			i18n.translate(
				'Automated daily scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
	},

	// * Scan Real-time *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_REALTIME_V2,
		getIcon: () => ( { icon: 'security', component: MaterialIcon as MemoExoticComponent< any > } ),
		getTitle: () => i18n.translate( 'Scan (real-time, automated)' ),
		getDescription: () =>
			i18n.translate(
				'Automated real-time scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/scan/" />,
					},
				}
			),
	},

	[ FEATURE_ANTISPAM_V2 ]: {
		getSlug: () => FEATURE_ANTISPAM_V2,
		getTitle: () => i18n.translate( 'Comment and form spam protection' ),
	},

	[ FEATURE_WAF ]: {
		getSlug: () => FEATURE_WAF,
		getTitle: () =>
			i18n.translate( 'Website firewall (WAF beta)', {
				comment: 'WAF stands for Web Application Firewall',
			} ),
	},

	[ FEATURE_ACTIVITY_LOG_1_YEAR_V2 ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG_1_YEAR_V2,
		getIcon: () => 'clipboard',
		getTitle: () => i18n.translate( 'Activity log: 1-year archive' ),
		getDescription: () =>
			i18n.translate(
				'View every change to your site in the last year. Pairs with VaultPress Backup to restore your site to any earlier version. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/security/activity-log/" />,
					},
				}
			),
	},

	[ FEATURE_SEARCH_V2 ]: {
		getSlug: () => FEATURE_SEARCH_V2,
		getTitle: () => i18n.translate( 'Instant search and indexing' ),
	},

	[ FEATURE_PRODUCT_SEARCH_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SEARCH_V2,
		getTitle: () => i18n.translate( 'Site Search up to 100k records and 100k requests/mo.' ),

		getDescription: () =>
			i18n.translate(
				'Help your site visitors find answers instantly so they keep reading and buying. Powerful filtering and customization options. {{link}}Learn more.{{/link}}',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/upgrade/search/" />,
					},
				}
			),
	},

	[ FEATURE_VIDEO_HOSTING_V2 ]: {
		getSlug: () => FEATURE_VIDEO_HOSTING_V2,
		getTitle: () => i18n.translate( 'Unlimited video hosting' ),
		getDescription: () =>
			i18n.translate(
				'Easy video uploads through an unbranded, customizable video player, enhanced with rich stats and unlimited storage space. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpack.com/features/writing/video-hosting/" />,
					},
				}
			),
	},

	[ FEATURE_CRM_V2 ]: {
		getSlug: () => FEATURE_CRM_V2,
		getTitle: () => i18n.translate( 'CRM Entrepreneur' ),
		getDescription: () =>
			i18n.translate(
				'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: <ExternalLink icon href="https://jetpackcrm.com" />,
					},
				}
			),
	},

	[ FEATURE_CRM_INTEGRATED_WITH_WORDPRESS ]: {
		getSlug: () => FEATURE_CRM_INTEGRATED_WITH_WORDPRESS,
		getTitle: () => i18n.translate( 'CRM fully integrated with WordPress' ),
	},

	[ FEATURE_CRM_LEADS_AND_FUNNEL ]: {
		getSlug: () => FEATURE_CRM_LEADS_AND_FUNNEL,
		getTitle: () => i18n.translate( 'Easily view leads and sales funnel' ),
	},

	[ FEATURE_CRM_PROPOSALS_AND_INVOICES ]: {
		getSlug: () => FEATURE_CRM_PROPOSALS_AND_INVOICES,
		getTitle: () => i18n.translate( 'Manage billing and create invoices' ),
	},

	[ FEATURE_CRM_TRACK_TRANSACTIONS ]: {
		getSlug: () => FEATURE_CRM_TRACK_TRANSACTIONS,
		getTitle: () => i18n.translate( 'Track transactions' ),
	},

	[ FEATURE_CRM_NO_CONTACT_LIMITS ]: {
		getSlug: () => FEATURE_CRM_NO_CONTACT_LIMITS,
		getTitle: () => i18n.translate( 'Unlimited contacts' ),
	},

	[ FEATURE_COLLECT_PAYMENTS_V2 ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_V2,
		getTitle: () => i18n.translate( 'Collect payments' ),
		getDescription: () =>
			i18n.translate(
				'Accept payments from credit or debit cards via Stripe. Sell products, collect donations, and set up recurring payments for subscriptions or memberships. {{link}}Learn more{{/link}}.',
				{
					components: {
						link: (
							<ExternalLink
								icon
								href="https://jetpack.com/support/jetpack-blocks/payments-block/"
							/>
						),
					},
				}
			),
	},
	[ FEATURE_SECURE_STORAGE_V2 ]: {
		getSlug: () => FEATURE_SECURE_STORAGE_V2,
		getTitle: () => i18n.translate( 'Unlimited backup storage' ),
	},

	[ FEATURE_ONE_CLICK_RESTORE_V2 ]: {
		getSlug: () => FEATURE_ONE_CLICK_RESTORE_V2,
		getTitle: () => i18n.translate( 'One-click restores' ),
		getDescription: () =>
			i18n.translate(
				'Revert back to a point-in-time in your site’s history, with a single click.'
			),
	},

	[ FEATURE_ONE_CLICK_FIX_V2 ]: {
		getSlug: () => FEATURE_ONE_CLICK_FIX_V2,
		getTitle: () => i18n.translate( 'One-click fixes for most issues' ),
	},

	[ FEATURE_INSTANT_EMAIL_V2 ]: {
		getSlug: () => FEATURE_INSTANT_EMAIL_V2,
		getTitle: () => i18n.translate( 'Instant email notifications' ),
	},

	[ FEATURE_AKISMET_V2 ]: {
		getSlug: () => FEATURE_AKISMET_V2,
		getTitle: () => i18n.translate( 'Powered by Akismet' ),
	},

	[ FEATURE_SPAM_BLOCK_V2 ]: {
		getSlug: () => FEATURE_SPAM_BLOCK_V2,
		getTitle: () => i18n.translate( 'Block spam without CAPTCHAs' ),
	},

	[ FEATURE_SPAM_10K_PER_MONTH ]: {
		getSlug: () => FEATURE_SPAM_10K_PER_MONTH,
		getTitle: () =>
			i18n.translate( '10K API calls/mo', {
				comment: '10 thousand API calls per month',
			} ),
	},

	[ FEATURE_FILTERING_V2 ]: {
		getSlug: () => FEATURE_FILTERING_V2,
		getTitle: () => i18n.translate( 'Powerful filtering' ),
	},

	[ FEATURE_LANGUAGE_SUPPORT_V2 ]: {
		getSlug: () => FEATURE_LANGUAGE_SUPPORT_V2,
		getTitle: () => i18n.translate( 'Supports 29 languages' ),
	},

	[ FEATURE_SPELLING_CORRECTION_V2 ]: {
		getSlug: () => FEATURE_SPELLING_CORRECTION_V2,
		getTitle: () => i18n.translate( 'Spelling correction' ),
	},

	[ FEATURE_SUPPORTS_WOOCOMMERCE_V2 ]: {
		getSlug: () => FEATURE_SUPPORTS_WOOCOMMERCE_V2,
		getTitle: () => i18n.translate( 'Works seamlessly with WooCommerce' ),
	},

	[ FEATURE_P2_3GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_3GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}3GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.translate( 'Upload images and documents and share them with your team.' ),
	},

	[ FEATURE_P2_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
		getDescription: () => i18n.translate( 'Invite as many people as you need to your P2.' ),
	},

	[ FEATURE_P2_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_POSTS_PAGES,
		getTitle: () => i18n.translate( 'Unlimited posts and pages' ),
		getDescription: () =>
			i18n.translate( 'Communicate as often as you want, with full access to your archive.' ),
	},

	[ FEATURE_P2_SIMPLE_SEARCH ]: {
		getSlug: () => FEATURE_P2_SIMPLE_SEARCH,
		getTitle: () => i18n.translate( 'Simple search' ),
		getDescription: () => i18n.translate( 'Easily find what you’re looking for.' ),
	},

	[ FEATURE_P2_CUSTOMIZATION_OPTIONS ]: {
		getSlug: () => FEATURE_P2_CUSTOMIZATION_OPTIONS,
		getTitle: () => i18n.translate( 'Customization options' ),
		getDescription: () =>
			i18n.translate( 'Make your team feel at home with some easy customization options.' ),
	},

	[ FEATURE_P2_13GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_13GB_STORAGE,
		getTitle: () =>
			i18n.translate( '{{strong}}13GB{{/strong}} storage space', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () => i18n.translate( 'Upload more files to your P2.' ),
	},

	[ FEATURE_P2_ADVANCED_SEARCH ]: {
		getSlug: () => FEATURE_P2_ADVANCED_SEARCH,
		getTitle: () => i18n.translate( 'Advanced search' ),
		getDescription: () =>
			i18n.translate(
				'A faster and more powerful search engine to make finding what you’re looking for easier.'
			),
	},

	[ FEATURE_P2_VIDEO_SHARING ]: {
		getSlug: () => FEATURE_P2_VIDEO_SHARING,
		getTitle: () => i18n.translate( 'Easy video sharing' ),
		getDescription: () =>
			i18n.translate(
				'Upload videos directly to your P2 for your team to see, without depending on external services.'
			),
	},

	[ FEATURE_P2_MORE_FILE_TYPES ]: {
		getSlug: () => FEATURE_P2_MORE_FILE_TYPES,
		getTitle: () => i18n.translate( 'More file types' ),
		getDescription: () => i18n.translate( 'Upload videos, audio, .zip and .key files.' ),
	},

	[ FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT ]: {
		getSlug: () => FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
		getTitle: () => i18n.translate( 'Priority customer support' ),
		getDescription: () =>
			i18n.translate(
				'Live chat is available 24 hours a day from Monday through Friday. You can also email us any day of the week for personalized support.'
			),
	},

	[ FEATURE_P2_ACTIVITY_OVERVIEW ]: {
		getSlug: () => FEATURE_P2_ACTIVITY_OVERVIEW,
		getTitle: () => i18n.translate( 'Activity overview panel' ),
		getDescription: () =>
			i18n.translate( 'A complete record of everything that happens on your P2.' ),
	},
	[ FEATURE_SFTP_DATABASE ]: {
		getSlug: () => FEATURE_SFTP_DATABASE,
		getTitle: () => i18n.translate( 'SFTP, SSH, WP-CLI, and Database access' ),
		getDescription: () =>
			i18n.translate(
				'A set of developer tools that give you more control over your site, simplify debugging, and make it easier to integrate with each step of your workflow.'
			),
	},

	[ PREMIUM_DESIGN_FOR_STORES ]: {
		getSlug: () => PREMIUM_DESIGN_FOR_STORES,
		getTitle: () => i18n.translate( 'Premium design options customized for online stores' ),
	},

	[ EXPERT_SUPPORT_ALL_DAYS ]: {
		getSlug: () => EXPERT_SUPPORT_ALL_DAYS,
		getTitle: () => i18n.translate( '24/7 expert support' ),
		getDescription: () => i18n.translate( '24/7 expert support' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_EDITOR ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_EDITOR,
		getTitle: () => i18n.translate( 'Built into WordPress editor' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_UNBRANDED ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
		getTitle: () => i18n.translate( 'Ad-free and brandable player' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_STORAGE,
		getTitle: () => i18n.translate( '1TB of storage' ),
	},

	/* START - Jetpack tiered product-specific features */
	[ FEATURE_JETPACK_1GB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_1GB_BACKUP_STORAGE,
		getTitle: () => i18n.translate( 'Starts with 1GB of storage' ),
	},
	[ FEATURE_JETPACK_10GB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_10GB_BACKUP_STORAGE,
		getTitle: () => i18n.translate( 'Starts with 10GB of storage' ),
	},
	[ FEATURE_JETPACK_1TB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_1TB_BACKUP_STORAGE,
		getTitle: () => i18n.translate( '1TB of backup storage' ),
	},
	[ FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( '30-day archive & activity log*' ),
	},
	[ FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( '1-year archive & activity log*' ),
	},
	[ FEATURE_JETPACK_PRODUCT_BACKUP ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_BACKUP,
		getTitle: () => i18n.translate( 'All VaultPress Backup features' ),
	},
	[ FEATURE_JETPACK_PRODUCT_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
		getTitle: () => i18n.translate( 'VideoPress' ),
	},
	[ FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES ]: {
		getSlug: () => FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
		getTitle: () => i18n.translate( 'All VaultPress Backup & Security features' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
		getTitle: () => i18n.translate( 'Real-time cloud backups' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
		getTitle: () => i18n.translate( 'Real-time malware scanning' ),
	},
	/* END - Jetpack tiered product-specific features */

	/* START - New features Flexible and Pro plans introduced. */
	[ FEATURE_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_UNLIMITED_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
	},
	[ FEATURE_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_UNLIMITED_POSTS_PAGES,
		getTitle: () => i18n.translate( 'Unlimited blog posts and pages' ),
	},
	[ FEATURE_PAYMENT_BLOCKS ]: {
		getSlug: () => FEATURE_PAYMENT_BLOCKS,
		getTitle: () => i18n.translate( 'Payment blocks' ),
	},
	[ FEATURE_TITAN_EMAIL ]: {
		getSlug: () => FEATURE_TITAN_EMAIL,
		getTitle: () => i18n.translate( 'Titan e-mail' ),
	},
	[ FEATURE_UNLIMITED_ADMINS ]: {
		getSlug: () => FEATURE_UNLIMITED_ADMINS,
		getTitle: () => i18n.translate( 'Unlimited admins' ),
	},
	[ FEATURE_ADDITIONAL_SITES ]: {
		getSlug: () => FEATURE_ADDITIONAL_SITES,
		getTitle: () => i18n.translate( 'Additional websites' ),
	},
	[ FEATURE_WOOCOMMERCE ]: {
		getSlug: () => FEATURE_WOOCOMMERCE,
		getTitle: () => i18n.translate( 'WooCommerce' ),
	},
	/* END - New features Flexible and Pro plans introduced. */

	[ FEATURE_UNLIMITED_EMAILS ]: {
		getSlug: () => FEATURE_UNLIMITED_EMAILS,
		getTitle: () => i18n.translate( 'Send unlimited emails' ),
	},
	[ FEATURE_UNLIMITED_SUBSCRIBERS ]: {
		getSlug: () => FEATURE_UNLIMITED_SUBSCRIBERS,
		getTitle: () => i18n.translate( 'Import unlimited subscribers' ),
	},
	[ FEATURE_IMPORT_SUBSCRIBERS ]: {
		getSlug: () => FEATURE_IMPORT_SUBSCRIBERS,
		getTitle: () => i18n.translate( 'Import subscribers' ),
	},
	[ FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER ]: {
		getSlug: () => FEATURE_ADD_MULTIPLE_PAGES_NEWSLETTER,
		getTitle: () => i18n.translate( `Add multiple pages to your Newsletter's website` ),
	},
	[ FEATURE_AD_FREE_EXPERIENCE ]: {
		getSlug: () => FEATURE_AD_FREE_EXPERIENCE,
		getTitle: () => i18n.translate( 'Ad-free browsing experience for your visitors' ),
		getDescription: () =>
			i18n.translate( 'Unlock a clean, ad-free browsing experience for your visitors.' ),
	},
	[ FEATURE_COLLECT_PAYMENTS_NEWSLETTER ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_NEWSLETTER,
		getTitle: () =>
			i18n.translate( 'Monetize your Newsletter with payments, subscriptions, and donations' ),
	},
	[ FEATURE_POST_BY_EMAIL ]: {
		getSlug: () => FEATURE_POST_BY_EMAIL,
		getTitle: () => i18n.translate( 'Post by email' ),
	},
	[ FEATURE_REAL_TIME_ANALYTICS ]: {
		getSlug: () => FEATURE_REAL_TIME_ANALYTICS,
		getTitle: () => i18n.translate( 'Real-time analytics in your dashboard' ),
	},
	[ FEATURE_GOOGLE_ANALYTICS_V2 ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS_V2,
		getTitle: () =>
			i18n.translate( 'Go deeper into site stats and insights with Google Analytics' ),
	},
	[ FEATURE_ADD_UNLIMITED_LINKS ]: {
		getSlug: () => FEATURE_ADD_UNLIMITED_LINKS,
		getTitle: () => i18n.translate( 'Add unlimited links to your page' ),
	},
	[ FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS ]: {
		getSlug: () => FEATURE_CUSTOMIZE_THEMES_BUTTONS_COLORS,
		getTitle: () => i18n.translate( 'Customizable themes, buttons, colors' ),
	},
	[ FEATURE_TRACK_VIEWS_CLICKS ]: {
		getSlug: () => FEATURE_TRACK_VIEWS_CLICKS,
		getTitle: () => i18n.translate( 'Track your view and click stats' ),
	},
	[ FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_LINK_IN_BIO,
		getTitle: () => i18n.translate( 'Charge for premium content' ),
	},
	[ FEATURE_NEWSLETTER_IMPORT_SUBSCRIBERS_FREE ]: {
		getSlug: () => FEATURE_NEWSLETTER_IMPORT_SUBSCRIBERS_FREE,
		getTitle: () => i18n.translate( 'Import up to 100 subscribers' ),
	},
	[ FEATURE_GROUP_PAYMENT_TRANSACTION_FEES ]: {
		getSlug: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
		getTitle: () => i18n.translate( 'Transaction fees for payments' ),
	},
	[ FEATURE_COMMISSION_FEE_STANDARD_FEATURES ]: {
		getSlug: () => FEATURE_COMMISSION_FEE_STANDARD_FEATURES,
		getTitle: () =>
			/* @ts-expect-error - fixMe method is not typed in the package. Once types are added upstream, remove this. */
			i18n.fixMe( {
				text: 'Transaction fee for standard payments (+\u00A0standard processing\u00A0fee)',
				newCopy: i18n.translate(
					'Transaction fee for standard payments (+\u00A0standard processing\u00A0fee)'
				),
				oldCopy: i18n.translate(
					'Commission fee for standard payment features (plus standard processing\u00A0fee)'
				),
			} ),
	},
	[ FEATURE_COMMISSION_FEE_WOO_FEATURES ]: {
		getSlug: () => FEATURE_COMMISSION_FEE_WOO_FEATURES,
		getTitle: () =>
			/* @ts-expect-error - fixMe method is not typed in the package. Once types are added upstream, remove this. */
			i18n.fixMe( {
				text: 'Transaction fee for standard WooCommerce payments (+ standard processing\u00A0fee)',
				newCopy: i18n.translate(
					'Transaction fee for standard WooCommerce payments (+ standard processing\u00A0fee)'
				),
				oldCopy: i18n.translate(
					'Commission fee for standard WooCommerce payment features (plus standard processing\u00A0fee)'
				),
			} ),
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_10 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_10,
		getTitle: () => getTransactionFeeCopy( 10 ),
		getAlternativeTitle: () => getTransactionFeeCopy( 10 ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_8 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_8,
		getTitle: () => getTransactionFeeCopy( 8 ),
		getAlternativeTitle: () => getTransactionFeeCopy( 8 ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_4 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_4,
		getTitle: () => getTransactionFeeCopy( 4 ),
		getAlternativeTitle: () => getTransactionFeeCopy( 4 ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_2 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_2,
		getTitle: () =>
			i18n.translate( '%(commission)d%% transaction fee for payments', {
				args: { commission: 2 },
			} ),
		getAlternativeTitle: () => '2%',
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_0 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_0,
		getTitle: () =>
			i18n.translate( '%(commission)d%% transaction fee for payments', {
				args: { commission: 0 },
			} ),
		getAlternativeTitle: () => '0%',
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_0_WOO ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_0_WOO,
		getTitle: () => getTransactionFeeCopy( 0, 'woo' ),
		getAlternativeTitle: () => '0%',
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_0_ALL ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_0_ALL,
		getTitle: () => getTransactionFeeCopy( 0, 'all' ),
		getAlternativeTitle: () => getTransactionFeeCopy( 0, 'all' ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_2_REGULAR ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_2_REGULAR,
		getTitle: () => getTransactionFeeCopy( 2, 'regular' ),
		getAlternativeTitle: () => {
			return (
				<>
					{ getTransactionFeeCopy( 2, 'regular' ) }
					<br />
					{ getTransactionFeeCopy( 0, 'woo' ) }
				</>
			);
		},
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_UNLIMITED_TRAFFIC ]: {
		getSlug: () => FEATURE_UNLIMITED_TRAFFIC,
		getTitle: () => i18n.translate( 'No limitations on site visitors' ),
		getDescription: () =>
			i18n.translate( 'Grow your site traffic without worrying about limitations.' ),
	},
	[ FEATURE_TIERED_STORAGE_PLANS_AVAILABLE ]: {
		getSlug: () => FEATURE_TIERED_STORAGE_PLANS_AVAILABLE,
		getTitle: () => i18n.translate( 'Tiered storage plans available' ),
		getDescription: () =>
			i18n.translate( 'Find the storage plan that works for your site’s needs.' ),
	},
	[ FEATURE_MANAGED_HOSTING ]: {
		getSlug: () => FEATURE_MANAGED_HOSTING,
		getTitle: () => i18n.translate( 'Managed hosting' ),
		getDescription: () =>
			i18n.translate(
				'All plans include world-class managed hosting, including automatic updates, security, backups, and more.'
			),
	},
	[ FEATURE_THE_READER ]: {
		getSlug: () => FEATURE_THE_READER,
		getTitle: () => i18n.translate( 'The Reader' ),
		getDescription: () =>
			i18n.translate(
				'Discover new reads and catch up on posts, comments, and replies from the sites you subscribe to.'
			),
	},

	/* START: 2023 Pricing Grid Features */
	[ FEATURE_BEAUTIFUL_THEMES ]: {
		getSlug: () => FEATURE_BEAUTIFUL_THEMES,
		getTitle: () => i18n.translate( 'Beautiful themes and patterns' ),
		getDescription: () =>
			i18n.translate( 'Transform your site design with themes and drag-and-drop layouts.' ),
	},
	[ FEATURE_PAGES ]: {
		getSlug: () => FEATURE_PAGES,
		getTitle: () => i18n.translate( 'Unlimited pages' ),
		getCompareTitle: () => i18n.translate( 'Add as many pages as you like.' ),
		getDescription: () => i18n.translate( 'Add as many pages as you like to your site.' ),
	},
	[ FEATURE_USERS ]: {
		getSlug: () => FEATURE_USERS,
		getTitle: () => i18n.translate( 'Unlimited users' ),
		getCompareTitle: () => i18n.translate( 'Invite others to contribute to your site.' ),
		getDescription: () =>
			i18n.translate( 'Invite others to contribute to your site and assign access permissions.' ),
	},
	[ FEATURE_NEWSLETTERS_RSS ]: {
		getSlug: () => FEATURE_NEWSLETTERS_RSS,
		getTitle: () => i18n.translate( 'Built-in newsletters & RSS' ),
		getDescription: () =>
			i18n.translate( 'Let your followers subscribe to your content as a newsletter or via RSS.' ),
	},
	[ FEATURE_POST_EDITS_HISTORY ]: {
		getSlug: () => FEATURE_POST_EDITS_HISTORY,
		getTitle: () => i18n.translate( 'Time machine for post edits' ),
		getDescription: () =>
			i18n.translate( 'Roll back your posts to an earlier edit with a built-in revision history.' ),
	},
	[ FEATURE_SECURITY_BRUTE_FORCE ]: {
		getSlug: () => FEATURE_SECURITY_BRUTE_FORCE,
		getTitle: () => i18n.translate( 'Brute-force protection' ),
		getDescription: () =>
			i18n.translate( 'Stay protected from brute-force attacks on your account password.' ),
	},
	[ FEATURE_SMART_REDIRECTS ]: {
		getSlug: () => FEATURE_SMART_REDIRECTS,
		getTitle: () => i18n.translate( 'Smart redirects' ),
		getDescription: () =>
			i18n.translate( 'Count on automatic redirects when you update your post or page’s URL.' ),
	},
	[ FEATURE_ALWAYS_ONLINE ]: {
		getSlug: () => FEATURE_ALWAYS_ONLINE,
		getTitle: () => i18n.translate( 'Online forever' ),
		getDescription: () => i18n.translate( 'Build and count on a site designed to last forever.' ),
	},
	[ FEATURE_FAST_DNS ]: {
		getSlug: () => FEATURE_FAST_DNS,
		getTitle: () => i18n.translate( 'Extremely fast DNS with SSL' ),
		getDescription: () =>
			i18n.translate( 'Tap into fast, reliable domain management with secure SSL.' ),
	},
	[ FEATURE_STYLE_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_STYLE_CUSTOMIZATION,
		getTitle: () => i18n.translate( 'Customize fonts and colors sitewide' ),
		getCompareTitle: () =>
			i18n.translate( 'Take control of every font, color, and detail of your site’s design.' ),
		getDescription: () =>
			i18n.translate( 'Take control of every font, color, and detail of your site’s design.' ),
	},
	[ FEATURE_DESIGN_TOOLS ]: {
		getSlug: () => FEATURE_DESIGN_TOOLS,
		getTitle: () => i18n.translate( 'Avant-garde design tools' ),
		getDescription: () =>
			i18n.translate(
				'Drag and drop your content and layouts with intuitive blocks and patterns.'
			),
	},
	[ FEATURE_WORDADS ]: {
		getSlug: () => FEATURE_WORDADS,
		getTitle: () => i18n.translate( 'Earn with WordAds' ),
		getDescription: () =>
			i18n.translate( 'Display ads and earn from premium networks via the WordAds program.' ),
	},
	[ FEATURE_PLUGINS_THEMES ]: {
		getSlug: () => FEATURE_PLUGINS_THEMES,
		getTitle: () => i18n.translate( 'Install plugins & themes' ),
		getDescription: () =>
			i18n.translate( 'Unlock access to 50,000+ plugins, design templates, and integrations.' ),
	},
	[ FEATURE_STATS_PAID ]: {
		getSlug: () => FEATURE_STATS_PAID,
		getTitle: () => {
			return isEnabled( 'stats/paid-wpcom-v3' )
				? i18n.translate( 'Detailed traffic stats beyond the last 7 days and site insights' )
				: i18n.translate( 'In-depth site analytics dashboard' );
		},
		getDescription: () =>
			i18n.translate(
				'Deep-dive analytics and conversion data to help you make decisions to grow your site.'
			),
	},
	[ FEATURE_STATS_COMMERCIAL ]: {
		getSlug: () => FEATURE_STATS_COMMERCIAL,
		getTitle: () => i18n.translate( 'In-depth site analytics dashboard' ),
		getDescription: () =>
			i18n.translate(
				'Deep-dive analytics and conversion data to help you make decisions to grow your site.'
			),
	},
	[ FEATURE_BANDWIDTH ]: {
		getSlug: () => FEATURE_BANDWIDTH,
		getTitle: () => i18n.translate( 'Unrestricted bandwidth' ),
		getDescription: () =>
			i18n.translate( 'Never fret about getting too much traffic or paying overage charges.' ),
	},
	[ FEATURE_BURST ]: {
		getSlug: () => FEATURE_BURST,
		getTitle: () => i18n.translate( 'High-burst capacity' ),
		getCompareTitle: () =>
			i18n.translate( 'Lean on integrated resource management and instant scaling.' ),
		getDescription: () =>
			i18n.translate( 'Lean on integrated resource management and instant scaling.' ),
	},
	[ FEATURE_WAF_V2 ]: {
		getSlug: () => FEATURE_WAF_V2,
		getTitle: () => i18n.translate( 'Web application firewall (WAF)' ),
		getDescription: () =>
			i18n.translate( 'Block out malicious activity like SQL injection and XSS attacks.' ),
	},
	[ FEATURE_CDN ]: {
		getSlug: () => FEATURE_CDN,
		getTitle: () => i18n.translate( 'Global CDN with 28+ locations' ),
		getCompareTitle: () =>
			i18n.translate( 'Rely on ultra-fast site speeds, from any location on earth.' ),
		getDescription: () =>
			i18n.translate( 'Rely on ultra-fast site speeds, just about anywhere on earth.' ),
	},
	[ FEATURE_CPUS ]: {
		getSlug: () => FEATURE_CPUS,
		getTitle: () => i18n.translate( 'High-frequency CPUs' ),
		getDescription: () =>
			i18n.translate( 'Get the extra site performance of high-frequency CPUs, as standard.' ),
	},
	[ FEATURE_DATACENTRE_FAILOVER ]: {
		getSlug: () => FEATURE_DATACENTRE_FAILOVER,
		getTitle: () => i18n.translate( 'Automatic datacenter failover' ),
		getDescription: () =>
			i18n.translate( 'Count on your site being replicated in real-time to a second data center.' ),
	},
	[ FEATURE_ISOLATED_INFRA ]: {
		getSlug: () => FEATURE_ISOLATED_INFRA,
		getTitle: () => i18n.translate( 'Isolated site infrastructure' ),
		getDescription: () =>
			i18n.translate(
				'Rest easy knowing that your site is isolated from others for added security and performance. '
			),
	},
	[ FEATURE_SECURITY_MALWARE ]: {
		getSlug: () => FEATURE_SECURITY_MALWARE,
		getTitle: () => i18n.translate( 'Malware detection & removal' ),
		getDescription: () =>
			i18n.translate( 'Stay safe with automated malware scanning and removal.' ),
	},
	[ FEATURE_REAL_TIME_SECURITY_SCANS ]: {
		getSlug: () => FEATURE_REAL_TIME_SECURITY_SCANS,
		getTitle: () => i18n.translate( 'Real-time security scans' ),
		getDescription: () =>
			i18n.translate(
				"Our dedicated security team works round-the-clock to identify and combat vulnerabilities so that you don't have to."
			),
	},
	[ FEATURE_SECURITY_VULNERABILITY_NOTIFICATIONS ]: {
		getSlug: () => FEATURE_SECURITY_VULNERABILITY_NOTIFICATIONS,
		getTitle: () => i18n.translate( 'Vulnerability notifications for core and plugins' ),
		getDescription: () =>
			i18n.translate(
				'We have a dedicated team identifying potential vulnerabilities for WordPress and plugins, ensuring early detection and preventing future attacks.'
			),
	},
	[ FEATURE_SECURITY_DDOS ]: {
		getSlug: () => FEATURE_SECURITY_DDOS,
		getTitle: () => i18n.translate( 'DDoS protection and mitigation' ),
		getDescription: () =>
			i18n.translate( 'Breeze past DDoS attacks thanks to real-time monitoring and mitigation.' ),
	},
	[ FEATURE_DEV_TOOLS ]: {
		getSlug: () => FEATURE_DEV_TOOLS,
		getTitle: () => i18n.translate( 'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments' ),
		getDescription: () =>
			i18n.translate( 'Use familiar developer tools to manage and deploy your site.' ),
	},
	[ FEATURE_SITE_STAGING_SITES ]: {
		getSlug: () => FEATURE_SITE_STAGING_SITES,
		getTitle: () => i18n.translate( 'Free staging site' ),
		getDescription: () => i18n.translate( 'Test product and design changes in a staging site.' ),
	},

	[ FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING ]: {
		getSlug: () => FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING,
		getTitle: () => i18n.translate( 'Seamless syncing between staging and production' ),
		getDescription: () =>
			i18n.translate(
				'Iterate faster and deploy confidently by synchronizing staging and production environments in a few short steps.'
			),
	},
	[ FEATURE_WP_UPDATES ]: {
		getSlug: () => FEATURE_WP_UPDATES,
		getTitle: () => i18n.translate( 'Automated WordPress updates' ),
		getDescription: () =>
			i18n.translate( 'Get every WordPress update. And every patch. Automatically.' ),
	},
	[ FEATURE_MULTI_SITE ]: {
		getSlug: () => FEATURE_MULTI_SITE,
		getTitle: () => i18n.translate( 'Centralized site management' ),
		getDescription: () =>
			i18n.translate( 'Seamlessly switch between 2, 20, or 200 sites. All from one place.' ),
	},
	[ FEATURE_SELL_SHIP ]: {
		getSlug: () => FEATURE_SELL_SHIP,
		getTitle: () => i18n.translate( 'Sell and ship products' ),
		getDescription: () => i18n.translate( 'Sell and ship out physical goods from your site.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_SELL_INTERNATIONALLY ]: {
		getSlug: () => FEATURE_SELL_INTERNATIONALLY,
		getTitle: () => i18n.translate( 'Sell internationally' ),
	},
	[ FEATURE_AUTOMATIC_SALES_TAX ]: {
		getSlug: () => FEATURE_AUTOMATIC_SALES_TAX,
		getTitle: () => i18n.translate( 'Automatic sales tax' ),
	},
	[ FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN ]: {
		getSlug: () => FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
		getTitle: () => i18n.translate( 'Automated backup + quick restore' ),
	},
	[ FEATURE_INTEGRATED_SHIPMENT_TRACKING ]: {
		getSlug: () => FEATURE_INTEGRATED_SHIPMENT_TRACKING,
		getTitle: () => i18n.translate( 'Shipment tracking' ),
	},
	[ FEATURE_SELL_EGIFTS_AND_VOUCHERS ]: {
		getSlug: () => FEATURE_SELL_EGIFTS_AND_VOUCHERS,
		getTitle: () => i18n.translate( 'Sell and accept e-gift vouchers' ),
	},
	[ FEATURE_EMAIL_MARKETING ]: {
		getSlug: () => FEATURE_EMAIL_MARKETING,
		getTitle: () => i18n.translate( 'Email marketing built-in' ),
	},
	[ FEATURE_MARKETPLACE_SYNC_SOCIAL_MEDIA_INTEGRATION ]: {
		getSlug: () => FEATURE_MARKETPLACE_SYNC_SOCIAL_MEDIA_INTEGRATION,
		getTitle: () => i18n.translate( 'Marketplace sync and social media integrations' ),
		getDescription: () => i18n.translate( 'Sync your store with marketplaces and social media.' ),
	},
	[ FEATURE_BACK_IN_STOCK_NOTIFICATIONS ]: {
		getSlug: () => FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
		getTitle: () => i18n.translate( 'Back in stock emails' ),
		getDescription: () =>
			i18n.translate( 'Notify customers when an out-of-stock item is back in stock.' ),
	},
	[ FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => FEATURE_MARKETING_AUTOMATION,
		getTitle: () => i18n.translate( 'Marketing automation' ),
		getDescription: () =>
			i18n.translate(
				'Automate marketing campaigns to send targeted and personalized messages to customers.'
			),
	},
	[ FEATURE_AUTOMATED_EMAIL_TRIGGERS ]: {
		getSlug: () => FEATURE_AUTOMATED_EMAIL_TRIGGERS,
		getTitle: () => i18n.translate( 'Automated email triggers' ),
		getDescription: () =>
			i18n.translate(
				'Set up automatic emails triggered by customer behavior, such as abandoned carts or completed purchases.'
			),
	},
	[ FEATURE_CART_ABANDONMENT_EMAILS ]: {
		getSlug: () => FEATURE_CART_ABANDONMENT_EMAILS,
		getTitle: () => i18n.translate( 'Cart abandonment emails' ),
		getDescription: () =>
			i18n.translate(
				'Send reminder emails to customers who have abandoned items in their cart to encourage them to complete their purchase.'
			),
	},
	[ FEATURE_REFERRAL_PROGRAMS ]: {
		getSlug: () => FEATURE_REFERRAL_PROGRAMS,
		getTitle: () => i18n.translate( 'Referral programs' ),
		getDescription: () =>
			i18n.translate(
				'Encourage existing customers to refer new customers by offering rewards or incentives.'
			),
	},
	[ FEATURE_CUSTOMER_BIRTHDAY_EMAILS ]: {
		getSlug: () => FEATURE_CUSTOMER_BIRTHDAY_EMAILS,
		getTitle: () => i18n.translate( 'Customer birthday emails' ),
		getDescription: () =>
			i18n.translate(
				'Send personalized birthday emails to customers with exclusive discounts or promotions.'
			),
	},
	[ FEATURE_LOYALTY_POINTS_PROGRAMS ]: {
		getSlug: () => FEATURE_LOYALTY_POINTS_PROGRAMS,
		getTitle: () => i18n.translate( 'Loyalty points programs' ),
		getDescription: () =>
			i18n.translate(
				'Reward customers for repeat purchases or other actions with loyalty points that can be redeemed for discounts or other benefits.'
			),
	},
	[ FEATURE_OFFER_BULK_DISCOUNTS ]: {
		getSlug: () => FEATURE_OFFER_BULK_DISCOUNTS,
		getTitle: () => i18n.translate( 'Offer bulk discounts' ),
		getDescription: () =>
			i18n.translate( 'Offer discounts for customers who purchase multiple items at once.' ),
	},
	[ FEATURE_RECOMMEND_ADD_ONS ]: {
		getSlug: () => FEATURE_RECOMMEND_ADD_ONS,
		getTitle: () => i18n.translate( 'Recommend add-ons' ),
		getDescription: () =>
			i18n.translate(
				'Recommend additional products to customers based on their purchase history.'
			),
	},
	[ FEATURE_ASSEMBLED_PRODUCTS_AND_KITS ]: {
		getSlug: () => FEATURE_ASSEMBLED_PRODUCTS_AND_KITS,
		getTitle: () => i18n.translate( 'Assembled products and kits' ),
		getDescription: () =>
			i18n.translate( 'Sell products that are assembled from multiple components.' ),
	},
	[ FEATURE_MIN_MAX_ORDER_QUANTITY ]: {
		getSlug: () => FEATURE_MIN_MAX_ORDER_QUANTITY,
		getTitle: () => i18n.translate( 'Min/Max Quantities' ),
		getDescription: () =>
			i18n.translate( 'Specify the minimum and maximum allowed product quantities for orders.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_CUSTOM_STORE ]: {
		getSlug: () => FEATURE_CUSTOM_STORE,
		getTitle: () => i18n.translate( 'Store customization' ),
		getDescription: () =>
			i18n.translate(
				'Offer customers a personalized shopping experience that they cannot find anywhere else.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_INVENTORY ]: {
		getSlug: () => FEATURE_INVENTORY,
		getTitle: () => i18n.translate( 'Inventory management' ),
		getDescription: () =>
			i18n.translate( 'Stay on top of your stock with inventory management tools.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_CHECKOUT ]: {
		getSlug: () => FEATURE_CHECKOUT,
		getTitle: () => i18n.translate( 'Easy checkout experience' ),
		getDescription: () =>
			i18n.translate(
				'Reduce cart abandonment and increase sales with a fast, low-friction checkout.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_ACCEPT_PAYMENTS_V2 ]: {
		getSlug: () => FEATURE_ACCEPT_PAYMENTS_V2,
		getTitle: () => i18n.translate( 'Payments in 60+ countries' ),
		getDescription: () =>
			i18n.translate( 'Accept payments for goods and services, just about anywhere.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_SALES_REPORTS ]: {
		getSlug: () => FEATURE_SALES_REPORTS,
		getTitle: () => i18n.translate( 'Sales reports' ),
		getDescription: () =>
			i18n.translate(
				'Stay up to date on sales and identify trends with intuitive sales reports.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_EXTENSIONS ]: {
		getSlug: () => FEATURE_EXTENSIONS,
		getTitle: () => i18n.translate( 'Extensions marketplace' ),
		getDescription: () =>
			i18n.translate( 'Find and install powerful add-ons for your site, all in one place.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	// FOLLOWING ARE JETPACK FEATURES BUNDLED IN WPCOM
	[ FEATURE_STATS_JP ]: {
		getSlug: () => FEATURE_STATS_JP,
		getTitle: () => i18n.translate( 'Visitor stats' ),
	},
	[ FEATURE_SPAM_JP ]: {
		getSlug: () => FEATURE_SPAM_JP,
		getTitle: () => i18n.translate( 'Spam protection with Akismet' ),
		getDescription: () =>
			i18n.translate(
				'Never worry about spam with Akismet, which is included at no additional cost.'
			),
	},
	[ FEATURE_LTD_SOCIAL_MEDIA_JP ]: {
		getSlug: () => FEATURE_LTD_SOCIAL_MEDIA_JP,
		getTitle: () => i18n.translate( 'Limited automatic shares in social media' ),
		getDescription: () =>
			i18n.translate(
				'Get 30 social shares per month to promote your posts on Facebook, Tumblr, and more.'
			),
	},
	[ FEATURE_SHARES_SOCIAL_MEDIA_JP ]: {
		getSlug: () => FEATURE_SHARES_SOCIAL_MEDIA_JP,
		getTitle: () => i18n.translate( 'Shares on social media' ),
		getDescription: () =>
			i18n.translate( 'Automatically share your latest post on Facebook, Tumblr, and more.' ),
	},
	[ FEATURE_SOCIAL_AUTO_SHARE ]: {
		getSlug: () => FEATURE_SOCIAL_AUTO_SHARE,
		getTitle: () => i18n.translate( 'Automatically share your posts and products on social media' ),
		getDescription: () =>
			i18n.translate(
				'Automatically share to Facebook, Instagram, Threads, LinkedIn, Mastodon, Tumblr, and Nextdoor.'
			),
	},
	[ FEATURE_SOCIAL_SHARES_1000 ]: {
		getSlug: () => FEATURE_SOCIAL_SHARES_1000,
		getTitle: () => i18n.translate( 'Share an unlimited number of posts' ),
		getDescription: () => i18n.translate( 'Share an unlimited number of posts.' ),
	},
	[ FEATURE_SOCIAL_ENHANCED_PUBLISHING ]: {
		getSlug: () => FEATURE_SOCIAL_ENHANCED_PUBLISHING,
		getTitle: () => i18n.translate( 'Upload custom images or videos with your posts' ),
		getDescription: () => i18n.translate( 'Upload custom images or videos with your posts.' ),
	},
	[ FEATURE_SOCIAL_IMAGE_GENERATOR ]: {
		getSlug: () => FEATURE_SOCIAL_IMAGE_GENERATOR,
		getTitle: () => i18n.translate( 'Automatically generate images for posts' ),
		getDescription: () =>
			i18n.translate(
				'Automatically generate custom images for posts using a template or a custom text.'
			),
	},
	[ FEATURE_CONTACT_FORM_JP ]: {
		getSlug: () => FEATURE_CONTACT_FORM_JP,
		getTitle: () => i18n.translate( 'Contact form' ),
		getDescription: () =>
			i18n.translate( 'Make it easy for your visitors to get in touch, right from your site.' ),
	},
	[ FEATURE_PAID_SUBSCRIBERS_JP ]: {
		getSlug: () => FEATURE_PAID_SUBSCRIBERS_JP,
		getTitle: () => i18n.translate( 'Paid subscribers' ),
		getDescription: () =>
			i18n.translate( 'Turn site visitors into subscribers, with built-in subscription tools.' ),
	},
	[ FEATURE_PREMIUM_CONTENT_JP ]: {
		getSlug: () => FEATURE_PREMIUM_CONTENT_JP,
		getTitle: () => i18n.translate( 'Paid content gating' ),
		getDescription: () => i18n.translate( 'Sell access to premium content, right from your site.' ),
	},
	[ FEATURE_VIDEOPRESS_JP ]: {
		getSlug: () => FEATURE_VIDEOPRESS_JP,
		getTitle: () => i18n.translate( 'Unlimited VideoPress videos' ),
		getDescription: () =>
			i18n.translate( 'Showcase your videos beautifully with the 4K VideoPress player.' ),
	},
	[ FEATURE_UNLTD_SOCIAL_MEDIA_JP ]: {
		getSlug: () => FEATURE_UNLTD_SOCIAL_MEDIA_JP,
		getTitle: () => i18n.translate( 'Unlimited automatic shares in social media' ),
		getDescription: () =>
			i18n.translate( 'Share your latest posts to your social channels, without limits.' ),
	},
	[ FEATURE_SEO_JP ]: {
		getSlug: () => FEATURE_SEO_JP,
		getTitle: () => i18n.translate( 'SEO and analytics tools' ),
		getDescription: () =>
			i18n.translate( 'Rank well in search with built-in search engine optimization tools.' ),
	},
	[ FEATURE_BRUTE_PROTECT_JP ]: {
		getSlug: () => FEATURE_CONTACT_FORM_JP,
		getTitle: () => i18n.translate( 'BruteProtect' ),
		getDescription: () =>
			i18n.translate(
				'Save server resources for a faster site, with malicious login protection built in.'
			),
	},
	[ FEATURE_REALTIME_BACKUPS_JP ]: {
		getSlug: () => FEATURE_REALTIME_BACKUPS_JP,
		getTitle: () => i18n.translate( 'Real-time backups' ),
		getDescription: () =>
			i18n.translate( 'Count on multi-redundancy, real-time backups of all your data.' ),
	},
	[ FEATURE_UPTIME_MONITOR_JP ]: {
		getSlug: () => FEATURE_UPTIME_MONITOR_JP,
		getTitle: () => i18n.translate( 'Uptime monitor' ),
		getDescription: () =>
			i18n.translate(
				'Stay up-to-date with continuous uptime monitoring, with alerts the minute downtime is detected.'
			),
	},
	[ FEATURE_GLOBAL_EDGE_CACHING ]: {
		getSlug: () => FEATURE_GLOBAL_EDGE_CACHING,
		getTitle: () => i18n.translate( 'Global edge caching' ),
		getDescription: () =>
			i18n.translate(
				'Ensure your cached content is always served from the data center closest to your site visitor.'
			),
	},
	[ FEATURE_ES_SEARCH_JP ]: {
		getSlug: () => FEATURE_ES_SEARCH_JP,
		getTitle: () => i18n.translate( 'Built-in Elasticsearch' ),
		getDescription: () =>
			i18n.translate( 'Make surfacing your content simple with built-in premium site search.' ),
	},
	[ FEATURE_PLUGIN_AUTOUPDATE_JP ]: {
		getSlug: () => FEATURE_PLUGIN_AUTOUPDATE_JP,
		getTitle: () => i18n.translate( 'Bundled plugin auto-updates' ),
		getDescription: () =>
			i18n.translate( 'Forget about time-consuming plugin updates and update nags.' ),
	},
	[ FEATURE_SITE_ACTIVITY_LOG_JP ]: {
		getSlug: () => FEATURE_SITE_ACTIVITY_LOG_JP,
		getTitle: () => i18n.translate( 'Unlimited site activity log' ),
		getDescription: () =>
			i18n.translate( 'Keep an administrative eye on activity across your site.' ),
	},
	[ FEATURE_DONATIONS_AND_TIPS_JP ]: {
		getSlug: () => FEATURE_DONATIONS_AND_TIPS_JP,
		getTitle: () => i18n.translate( 'Donations and tips' ),
		getDescription: () =>
			i18n.translate( 'Allow your audience to support your work easily with donations and tips.' ),
	},
	[ FEATURE_PAYPAL_JP ]: {
		getSlug: () => FEATURE_PAYPAL_JP,
		getTitle: () => i18n.translate( 'Collect payments with PayPal' ),
		getDescription: () =>
			i18n.translate( 'Collect payments or donations securely through your site via PayPal.' ),
	},
	[ FEATURE_PAYMENT_BUTTONS_JP ]: {
		getSlug: () => FEATURE_PAYMENT_BUTTONS_JP,
		getTitle: () => i18n.translate( 'Payment buttons' ),
		getDescription: () =>
			i18n.translate(
				'Collect payments from credit/debit cards securely from anywhere with Stripe.'
			),
	},
	[ FEATURE_WOOCOMMERCE_HOSTING ]: {
		getSlug: () => FEATURE_WOOCOMMERCE_HOSTING,
		getTitle: () => {
			return i18n.translate( 'eCommerce tools and optimized WooCommerce hosting' );
		},
		getDescription: () =>
			i18n.translate(
				'Enjoy a hosting solution tailored to enhance the performance and security of sites running WooCommerce.'
			),
	},
	[ FEATURE_PREMIUM_STORE_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_STORE_THEMES,
		getTitle: () => i18n.translate( 'Premium store themes' ),
		getDescription: () =>
			i18n.translate( 'Jumpstart your store’s design with a professionally designed theme.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_STORE_DESIGN ]: {
		getSlug: () => FEATURE_STORE_DESIGN,
		getTitle: () => i18n.translate( 'Powerful store design tools' ),
		getDescription: () =>
			i18n.translate(
				'Fine-tune your store’s design with on-brand styles and drag and drop layout editing.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_UNLIMITED_PRODUCTS ]: {
		getSlug: () => FEATURE_UNLIMITED_PRODUCTS,
		getTitle: () => i18n.translate( 'Unlimited products' ),
		getDescription: () =>
			i18n.translate(
				'Grow your store as big as you want with the ability to add unlimited products and services.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_DISPLAY_PRODUCTS_BRAND ]: {
		getSlug: () => FEATURE_DISPLAY_PRODUCTS_BRAND,
		getTitle: () => i18n.translate( 'Display products by brand' ),
		getDescription: () =>
			i18n.translate(
				'Create, assign and list brands for products, and allow customers to view by brand.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_PRODUCT_ADD_ONS ]: {
		getSlug: () => FEATURE_PRODUCT_ADD_ONS,
		getTitle: () => i18n.translate( 'Product Add-Ons' ),
		getDescription: () =>
			i18n.translate(
				'Offer extra products and services, such as gift wrapping, a special message, extended warranty, insurance, customizations, and more.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_ASSEMBLED_KITS ]: {
		getSlug: () => FEATURE_ASSEMBLED_KITS,
		getTitle: () => i18n.translate( 'Assembled products and kits' ),
		getDescription: () =>
			i18n.translate(
				'Give customers the freedom to build their own products utilizing your existing items.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_STOCK_NOTIFS ]: {
		getSlug: () => FEATURE_STOCK_NOTIFS,
		getTitle: () => i18n.translate( 'Back-in-stock notifications' ),
		getDescription: () =>
			i18n.translate( 'Automatically notify customers when your products are restocked.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_DYNAMIC_UPSELLS ]: {
		getSlug: () => FEATURE_DYNAMIC_UPSELLS,
		getTitle: () => i18n.translate( 'Dynamic product upsells' ),
		getDescription: () =>
			i18n.translate(
				'Earn more revenue with automated upsell and cross-sell product recommendations.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_CUSTOM_MARKETING_AUTOMATION ]: {
		getSlug: () => FEATURE_CUSTOM_MARKETING_AUTOMATION,
		getTitle: () => i18n.translate( 'Custom marketing automation' ),
		getDescription: () =>
			i18n.translate(
				'Advanced email marketing functionality, including subscriber segmentation, advanced analytics, and automation.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_BULK_DISCOUNTS ]: {
		getSlug: () => FEATURE_BULK_DISCOUNTS,
		getTitle: () => i18n.translate( 'Offer bulk discounts' ),
		getDescription: () => i18n.translate( 'Offer personalized packages and bulk discounts.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_INVENTORY_MGMT ]: {
		getSlug: () => FEATURE_INVENTORY_MGMT,
		getTitle: () => i18n.translate( 'Inventory management' ),
		getDescription: () =>
			i18n.translate( 'Keep inventory up-to-date with POS integrations and real-time tracking.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_STREAMLINED_CHECKOUT ]: {
		getSlug: () => FEATURE_STREAMLINED_CHECKOUT,
		getTitle: () => i18n.translate( 'Streamlined, extendable checkout' ),
		getDescription: () =>
			i18n.translate(
				'Remove the friction from checkout by giving your customers multiple ways to pay.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_SELL_60_COUNTRIES ]: {
		getSlug: () => FEATURE_SELL_60_COUNTRIES,
		getTitle: () => i18n.translate( 'Sell in 60+ countries' ),
		getDescription: () => i18n.translate( 'Grow globally by accepting 135+ currencies.' ),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_SHIPPING_INTEGRATIONS ]: {
		getSlug: () => FEATURE_SHIPPING_INTEGRATIONS,
		getTitle: () => i18n.translate( 'Integrations with top shipping carriers' ),
		getDescription: () =>
			i18n.translate(
				'Get real-time shipping prices, print labels and give your customers tracking codes.'
			),
		getCompareSubtitle: () => i18n.translate( 'Seamlessly integrated with your plan' ),
	},
	[ FEATURE_SUPPORT ]: {
		getSlug: () => FEATURE_SUPPORT,
		getTitle: () => i18n.translate( 'Support' ),
	},
	[ FEATURE_FAST_SUPPORT_FROM_EXPERTS ]: {
		getSlug: () => FEATURE_FAST_SUPPORT_FROM_EXPERTS,
		getTitle: () => i18n.translate( 'Fast support from our expert\u00A0team' ),
		getDescription: () =>
			i18n.translate( 'Prompt support from our expert, friendly Happiness team' ),
	},
	[ FEATURE_PRIORITY_24_7_SUPPORT ]: {
		getSlug: () => FEATURE_PRIORITY_24_7_SUPPORT,
		getTitle: () => i18n.translate( 'Priority 24/7 support from our expert\u00A0team' ),
		getDescription: () =>
			i18n.translate( 'The fastest 24/7 support from our expert, friendly Happiness team' ),
	},
	[ FEATURE_UPLOAD_VIDEO ]: {
		getSlug: () => FEATURE_UPLOAD_VIDEO,
		getTitle: () => i18n.translate( 'Upload videos' ),
		getDescription: () =>
			i18n.translate(
				'Upload video files like mp4 and display them beautifully in 4K resolution, with picture-in-picture, subtitles, and without intrusive ads.'
			),
	},
	// For the copy request dated 20250207 in pcNC1U-1vN-p2
	[ FEATURE_STATS_BASIC_20250206 ]: {
		getSlug: () => FEATURE_STATS_BASIC_20250206,
		getTitle: () => i18n.translate( 'Stats' ),
		getDescription: () =>
			i18n.translate( 'Access full traffic history, filter by date, and see peak traffic times.' ),
	},
	[ FEATURE_STATS_ADVANCED_20250206 ]: {
		getSlug: () => FEATURE_STATS_ADVANCED_20250206,
		getTitle: () => i18n.translate( 'Premium stats' ),
		getDescription: () =>
			i18n.translate( 'Unlock all stats, including UTM tracking and device insights.' ),
	},
	/* END: 2023 Pricing Grid Features */

	/* START: Woo Express Features */
	[ FEATURE_WOOCOMMERCE_STORE ]: {
		getSlug: () => FEATURE_WOOCOMMERCE_STORE,
		getTitle: () => i18n.translate( 'WooCommerce store' ),
		getDescription: () => '',
	},
	[ FEATURE_WOOCOMMERCE_MOBILE_APP ]: {
		getSlug: () => FEATURE_WOOCOMMERCE_MOBILE_APP,
		getTitle: () => i18n.translate( 'WooCommerce mobile app' ),
		getDescription: () => '',
	},
	[ FEATURE_WORDPRESS_CMS ]: {
		getSlug: () => FEATURE_WORDPRESS_CMS,
		getTitle: () => i18n.translate( 'WordPress CMS' ),
		getDescription: () => '',
	},
	[ FEATURE_WORDPRESS_MOBILE_APP ]: {
		getSlug: () => FEATURE_WORDPRESS_MOBILE_APP,
		getTitle: () => i18n.translate( 'WordPress mobile app' ),
		getDescription: () => '',
	},
	[ FEATURE_FREE_SSL_CERTIFICATE ]: {
		getSlug: () => FEATURE_FREE_SSL_CERTIFICATE,
		getTitle: () => i18n.translate( 'Free SSL certificate' ),
		getDescription: () => '',
	},
	[ FEATURE_GOOGLE_ANALYTICS_V3 ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS_V3,
		getTitle: () => i18n.translate( 'Google Analytics' ),
		getDescription: () => '',
	},
	[ FEATURE_LIST_UNLIMITED_PRODUCTS ]: {
		getSlug: () => FEATURE_LIST_UNLIMITED_PRODUCTS,
		getTitle: () => i18n.translate( 'List unlimited products' ),
		getDescription: () => '',
	},
	[ FEATURE_GIFT_CARDS ]: {
		getSlug: () => FEATURE_GIFT_CARDS,
		getTitle: () => i18n.translate( 'Gift Cards' ),
		getDescription: () =>
			i18n.translate( 'Offer multi-purpose gift cards that customers can redeem online.' ),
	},
	[ FEATURE_PRODUCT_BUNDLES ]: {
		getSlug: () => FEATURE_PRODUCT_BUNDLES,
		getTitle: () => i18n.translate( 'Product Bundles' ),
		getDescription: () =>
			i18n.translate(
				'Combine products in bundles. Offer discount packages and create product kits and curated lists of products that are bought together often.'
			),
	},
	[ FEATURE_CUSTOM_PRODUCT_KITS ]: {
		getSlug: () => FEATURE_CUSTOM_PRODUCT_KITS,
		getTitle: () => i18n.translate( 'Custom product kits' ),
		getDescription: () => '',
	},
	[ FEATURE_LIST_PRODUCTS_BY_BRAND ]: {
		getSlug: () => FEATURE_LIST_PRODUCTS_BY_BRAND,
		getTitle: () => i18n.translate( 'List products by brand' ),
		getDescription: () => '',
	},
	[ FEATURE_PRODUCT_RECOMMENDATIONS ]: {
		getSlug: () => FEATURE_PRODUCT_RECOMMENDATIONS,
		getTitle: () => i18n.translate( 'Product Recommendations' ),
		getDescription: () =>
			i18n.translate(
				'Offer smart upsells, cross-sells, and “frequently bought together” recommendations and measure their impact with in-depth analytics.'
			),
	},
	[ FEATURE_INTEGRATED_PAYMENTS ]: {
		getSlug: () => FEATURE_INTEGRATED_PAYMENTS,
		getTitle: () => i18n.translate( 'Integrated payments' ),
		getDescription: () => '',
	},
	[ FEATURE_INTERNATIONAL_PAYMENTS ]: {
		getSlug: () => FEATURE_INTERNATIONAL_PAYMENTS,
		getTitle: () => i18n.translate( 'International payments' ),
		getDescription: () => '',
	},
	[ FEATURE_AUTOMATED_SALES_TAXES ]: {
		getSlug: () => FEATURE_AUTOMATED_SALES_TAXES,
		getTitle: () => i18n.translate( 'Automated sales taxes' ),
		getDescription: () => '',
	},
	[ FEATURE_ACCEPT_LOCAL_PAYMENTS ]: {
		getSlug: () => FEATURE_ACCEPT_LOCAL_PAYMENTS,
		getTitle: () => i18n.translate( 'Accept local payments' ),
		getDescription: () => '',
	},
	[ FEATURE_RECURRING_PAYMENTS ]: {
		getSlug: () => FEATURE_RECURRING_PAYMENTS,
		getTitle: () => i18n.translate( 'Recurring payments' ),
		getDescription: () => '',
	},
	[ FEATURE_PROMOTE_ON_TIKTOK ]: {
		getSlug: () => FEATURE_PROMOTE_ON_TIKTOK,
		getTitle: () => i18n.translate( 'Promote on TikTok' ),
		getDescription: () => '',
	},
	[ FEATURE_SYNC_WITH_PINTEREST ]: {
		getSlug: () => FEATURE_SYNC_WITH_PINTEREST,
		getTitle: () => i18n.translate( 'Sync with Pinterest' ),
		getDescription: () => '',
	},
	[ FEATURE_CONNECT_WITH_FACEBOOK ]: {
		getSlug: () => FEATURE_CONNECT_WITH_FACEBOOK,
		getTitle: () => i18n.translate( 'Connect with Facebook' ),
		getDescription: () => '',
	},
	[ FEATURE_ABANDONED_CART_RECOVERY ]: {
		getSlug: () => FEATURE_ABANDONED_CART_RECOVERY,
		getTitle: () => i18n.translate( 'Abandoned cart recovery' ),
		getDescription: () => '',
	},
	[ FEATURE_ADVERTISE_ON_GOOGLE ]: {
		getSlug: () => FEATURE_ADVERTISE_ON_GOOGLE,
		getTitle: () => i18n.translate( 'Advertise on Google' ),
		getDescription: () => '',
	},
	[ FEATURE_CUSTOM_ORDER_EMAILS ]: {
		getSlug: () => FEATURE_CUSTOM_ORDER_EMAILS,
		getTitle: () => i18n.translate( 'Custom order emails' ),
		getDescription: () => '',
	},
	[ FEATURE_LIVE_SHIPPING_RATES ]: {
		getSlug: () => FEATURE_LIVE_SHIPPING_RATES,
		getTitle: () => i18n.translate( 'Live shipping rates' ),
		getDescription: () => '',
	},
	[ FEATURE_DISCOUNTED_SHIPPING ]: {
		getSlug: () => FEATURE_DISCOUNTED_SHIPPING,
		getTitle: () => i18n.translate( 'Discounted shipping' ),
		getDescription: () => '',
	},
	[ FEATURE_PRINT_SHIPPING_LABELS ]: {
		getSlug: () => FEATURE_PRINT_SHIPPING_LABELS,
		getTitle: () => i18n.translate( 'Print shipping labels' ),
		getDescription: () => '',
	},
	[ FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION ]: {
		getSlug: () => FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION,
		getTitle: () => i18n.translate( 'AI-assisted product descriptions' ),
		getDescription: () => '',
	},
	/* END: Woo Express Features */

	/* START: Sensei Features */
	[ FEATURE_SENSEI_SUPPORT ]: {
		getSlug: () => FEATURE_SENSEI_SUPPORT,
		getTitle: () => i18n.translate( 'Priority live chat support' ),
	},
	[ FEATURE_SENSEI_UNLIMITED ]: {
		getSlug: () => FEATURE_SENSEI_UNLIMITED,
		getTitle: () => i18n.translate( 'Unlimited courses and students' ),
	},
	[ FEATURE_SENSEI_INTERACTIVE ]: {
		getSlug: () => FEATURE_SENSEI_INTERACTIVE,
		getTitle: () => i18n.translate( 'Interactive videos and lessons' ),
	},
	[ FEATURE_SENSEI_QUIZZES ]: {
		getSlug: () => FEATURE_SENSEI_QUIZZES,
		getTitle: () => i18n.translate( 'Quizzes and certificates' ),
	},
	[ FEATURE_SENSEI_SELL_COURSES ]: {
		getSlug: () => FEATURE_SENSEI_SELL_COURSES,
		getTitle: () => i18n.translate( 'Sell courses' ),
	},
	[ FEATURE_SENSEI_STORAGE ]: {
		getSlug: () => FEATURE_SENSEI_STORAGE,
		getTitle: () => i18n.translate( '50 GB file and video storage' ),
	},
	[ FEATURE_SENSEI_HOSTING ]: {
		getSlug: () => FEATURE_SENSEI_HOSTING,
		getTitle: () => i18n.translate( 'Best-in-class hosting' ),
	},
	[ FEATURE_SENSEI_JETPACK ]: {
		getSlug: () => FEATURE_SENSEI_JETPACK,
		getTitle: () => i18n.translate( 'Advanced Jetpack features' ),
	},
	/* END: Sensei Features */

	[ FEATURE_BIG_SKY_WEBSITE_BUILDER ]: {
		getSlug: () => FEATURE_BIG_SKY_WEBSITE_BUILDER,
		getTitle: () =>
			i18n.translate( '{{strong}}Unlimited AI Website Builder edits{{/strong}}', {
				components: {
					strong: <strong />,
				},
			} ),
		getDescription: () =>
			i18n.getLocaleSlug()?.startsWith( 'en' ) ||
			i18n.hasTranslation(
				'Enjoy unrestricted usage of our AI tool to design your perfect website.'
			)
				? i18n.translate(
						'Enjoy unrestricted usage of our AI tool to design your perfect website.'
				  )
				: i18n.translate( 'Build your site with our AI Website Builder.' ),
	},
	[ FEATURE_BIG_SKY_WEBSITE_BUILDER_CHECKOUT ]: {
		getSlug: () => FEATURE_BIG_SKY_WEBSITE_BUILDER_CHECKOUT,
		getTitle: () => i18n.translate( 'Unlimited AI Website Builder edits' ),
		getDescription: () =>
			i18n.getLocaleSlug()?.startsWith( 'en' ) ||
			i18n.hasTranslation(
				'Enjoy unrestricted usage of our AI tool to design your perfect website.'
			)
				? i18n.translate(
						'Enjoy unrestricted usage of our AI tool to design your perfect website.'
				  )
				: i18n.translate( 'Build your site with our AI Website Builder.' ),
	},

	[ FEATURE_UNLIMITED_ENTITIES ]: {
		getSlug: () => FEATURE_UNLIMITED_ENTITIES,
		getTitle: () => i18n.translate( 'Unlimited pages, posts, users, and visitors' ),
		getDescription: () =>
			i18n.translate( 'Grow your site without limits — unlimited content, users, and traffic.' ),
	},
	[ FEATURE_WOO_THEMES ]: {
		getSlug: () => FEATURE_WOO_THEMES,
		getTitle: () => i18n.translate( '3 bundled premium WooCommerce themes' ),
	},
	[ FEATURE_WOO_SOCIAL_MEDIA_INTEGRATIONS ]: {
		getSlug: () => FEATURE_WOO_SOCIAL_MEDIA_INTEGRATIONS,
		getTitle: () => i18n.translate( 'Social media integrations' ),
		getDescription: () =>
			i18n.translate(
				'Be visible and let your customers connect with your brand on social media channels.'
			),
	},
	[ FEATURE_WOO_PAYMENTS ]: {
		getSlug: () => FEATURE_WOO_PAYMENTS,
		getTitle: () => i18n.translate( 'WooCommerce Payments' ),
		getDescription: () =>
			i18n.translate(
				'Accept online payments, track revenue, and handle all payment activity from your store’s dashboard.'
			),
	},
	[ FEATURE_WOO_SHIPPING_TRACKING ]: {
		getSlug: () => FEATURE_WOO_SHIPPING_TRACKING,
		getTitle: () => i18n.translate( 'Shipping & tracking' ),
		getDescription: () => i18n.translate( 'Integrations with top shipping carriers.' ),
	},
	[ FEATURE_WOO_TAX_SOLUTIONS ]: {
		getSlug: () => FEATURE_WOO_TAX_SOLUTIONS,
		getTitle: () => i18n.translate( 'Tax solutions - Avalara & EU VAT' ),
		getDescription: () => i18n.translate( 'Automate your tax calculations.' ),
	},
	[ FEATURE_WOO_BRANDS ]: {
		getSlug: () => FEATURE_WOO_BRANDS,
		getTitle: () => i18n.translate( 'WooCommerce Brands' ),
		getDescription: () =>
			i18n.translate(
				'Assign your products to brands and make it easier for your customers to browse your catalog by brand.'
			),
	},
	[ FEATURE_WOO_AUTOMATE ]: {
		getSlug: () => FEATURE_WOO_AUTOMATE,
		getTitle: () => i18n.translate( 'AutomateWoo' ),
		getDescription: () =>
			i18n.translate(
				'Create a near-endless range of automated workflows to help you grow your store, including different combinations of triggers, rules, and actions.'
			),
	},
	[ FEATURE_GOOGLE_LISTING_ADS ]: {
		getSlug: () => FEATURE_GOOGLE_LISTING_ADS,
		getTitle: () => i18n.translate( 'Google Listings & Ads' ),
		getDescription: () =>
			i18n.translate(
				'Create free listings and ads to showcase your products to shoppers across Google.'
			),
	},
	[ FEATURE_CONNECT_ANALYTICS ]: {
		getSlug: () => FEATURE_CONNECT_ANALYTICS,
		getTitle: () => i18n.translate( 'Connect Google Analytics' ),
		getDescription: () =>
			i18n.translate(
				'Link your accounts to gain more valuable insights in seconds. No coding required.'
			),
	},
	[ FEATURE_LIMITED_SITE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_LIMITED_SITE_ACTIVITY_LOG,
		getTitle: () => i18n.translate( 'Limited site activity log' ),
		getDescription: () =>
			i18n.translate( 'Keep an administrative eye on activity across your site.' ),
	},
};

export { FEATURES_LIST };
