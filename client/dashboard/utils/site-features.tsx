import {
	DotcomFeatures,
	FEATURE_13GB_STORAGE,
	FEATURE_1GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_3GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_99_999_UPTIME,
	FEATURE_ABANDONED_CART_RECOVERY,
	FEATURE_ACCEPT_LOCAL_PAYMENTS,
	FEATURE_ACCEPT_PAYMENTS_V2,
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_ACTIVITY_LOG_1_YEAR_V2,
	FEATURE_ACTIVITY_LOG,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
	FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
	FEATURE_ADVANCED_SEO_TOOLS,
	FEATURE_ADVANCED_SEO,
	FEATURE_ADVERTISE_ON_GOOGLE,
	FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION,
	FEATURE_ALL_BUSINESS_FEATURES,
	FEATURE_ALL_FREE_FEATURES_JETPACK,
	FEATURE_ALL_FREE_FEATURES,
	FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
	FEATURE_ALL_PERSONAL_FEATURES,
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	FEATURE_ALL_PREMIUM_FEATURES,
	FEATURE_ANTISPAM_V2,
	FEATURE_AUDIO_UPLOADS,
	FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
	FEATURE_AUTOMATED_RESTORES,
	FEATURE_AUTOMATED_SALES_TAXES,
	FEATURE_AUTOMATIC_SECURITY_FIXES,
	FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
	FEATURE_BACKUP_ARCHIVE_30,
	FEATURE_BACKUP_ARCHIVE_UNLIMITED,
	FEATURE_BACKUP_DAILY_V2,
	FEATURE_BACKUP_REALTIME_V2,
	FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
	FEATURE_BLANK,
	FEATURE_BLOG_DOMAIN,
	FEATURE_CDN,
	FEATURE_CLOUD_CRITICAL_CSS,
	FEATURE_COLLECT_PAYMENTS_V2,
	FEATURE_COMMUNITY_SUPPORT,
	FEATURE_CONNECT_WITH_FACEBOOK,
	FEATURE_CRM_V2,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_CUSTOM_ORDER_EMAILS,
	FEATURE_DEV_TOOLS_GIT,
	FEATURE_DEV_TOOLS_SSH,
	FEATURE_DEV_TOOLS,
	FEATURE_DISCOUNTED_SHIPPING,
	FEATURE_EARN_AD,
	FEATURE_EASY_SITE_MIGRATION,
	FEATURE_ECOMMERCE_MARKETING,
	FEATURE_FAST_SUPPORT_FROM_EXPERTS,
	FEATURE_FREE_BLOG_DOMAIN,
	FEATURE_FREE_DOMAIN,
	FEATURE_FREE_SSL_CERTIFICATE,
	FEATURE_FREE_THEMES_SIGNUP,
	FEATURE_FREE_THEMES,
	FEATURE_FREE_WORDPRESS_THEMES,
	FEATURE_GIFT_CARDS,
	FEATURE_GOOGLE_ANALYTICS_V3,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_GOOGLE_LISTING_ADS,
	FEATURE_GOOGLE_MY_BUSINESS,
	FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	FEATURE_HOSTING,
	FEATURE_INSTALL_PLUGINS,
	FEATURE_INTEGRATED_PAYMENTS,
	FEATURE_INTEGRATED_SHIPMENT_TRACKING,
	FEATURE_INTERNATIONAL_PAYMENTS,
	FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_10GB_BACKUP_STORAGE,
	FEATURE_JETPACK_1GB_BACKUP_STORAGE,
	FEATURE_JETPACK_1TB_BACKUP_STORAGE,
	FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
	FEATURE_JETPACK_ADVANCED,
	FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_JETPACK_PRODUCT_BACKUP,
	FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
	FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
	FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_VIDEOPRESS_EDITOR,
	FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
	FEATURE_JETPACK_VIDEOPRESS_STORAGE,
	FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_LIST_PRODUCTS_BY_BRAND,
	FEATURE_LIST_UNLIMITED_PRODUCTS,
	FEATURE_LIVE_SHIPPING_RATES,
	FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
	FEATURE_MALWARE_SCANNING_DAILY,
	FEATURE_MANAGE,
	FEATURE_MANAGED_HOSTING,
	FEATURE_MARKETING_AUTOMATION,
	FEATURE_MEMBERSHIPS,
	FEATURE_MIN_MAX_ORDER_QUANTITY,
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
	FEATURE_PAYMENT_BLOCKS,
	FEATURE_PAYMENT_TRANSACTION_FEES_0,
	FEATURE_PAYMENT_TRANSACTION_FEES_2,
	FEATURE_PAYMENT_TRANSACTION_FEES_4,
	FEATURE_PAYMENT_TRANSACTION_FEES_8,
	FEATURE_PLAN_SECURITY_DAILY,
	FEATURE_PLUGINS_THEMES,
	FEATURE_PREMIUM_CONTENT_BLOCK,
	FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
	FEATURE_PREMIUM_SUPPORT,
	FEATURE_PREMIUM_THEMES,
	FEATURE_PRINT_SHIPPING_LABELS,
	FEATURE_PRIORITY_24_7_SUPPORT,
	FEATURE_PRODUCT_ADD_ONS,
	FEATURE_PRODUCT_BACKUP_DAILY_V2,
	FEATURE_PRODUCT_BACKUP_REALTIME_V2,
	FEATURE_PRODUCT_BUNDLES,
	FEATURE_PRODUCT_RECOMMENDATIONS,
	FEATURE_PRODUCT_SCAN_DAILY_V2,
	FEATURE_PRODUCT_SCAN_REALTIME_V2,
	FEATURE_PRODUCT_SEARCH_V2,
	FEATURE_PROMOTE_ON_TIKTOK,
	FEATURE_REAL_TIME_SECURITY_SCANS,
	FEATURE_RECURRING_PAYMENTS,
	FEATURE_REPUBLICIZE,
	FEATURE_SALES_REPORTS,
	FEATURE_SCAN_V2,
	FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING,
	FEATURE_SECURITY_DDOS,
	FEATURE_SELL_SHIP,
	FEATURE_SEO_PREVIEW_TOOLS,
	FEATURE_SFTP_DATABASE,
	FEATURE_SHIPPING_CARRIERS,
	FEATURE_SIMPLE_PAYMENTS,
	FEATURE_SITE_BACKUPS_AND_RESTORE,
	FEATURE_SITE_STAGING_SITES,
	FEATURE_SITE_STATS,
	FEATURE_SPAM_AKISMET_PLUS,
	FEATURE_STANDARD_SECURITY_TOOLS,
	FEATURE_STATS_COMMERCIAL,
	FEATURE_STATS_PAID,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_SYNC_WITH_PINTEREST,
	FEATURE_TITAN_EMAIL,
	FEATURE_TRACK_VIEWS_CLICKS,
	FEATURE_TRAFFIC_TOOLS,
	FEATURE_UNLIMITED_ADMINS,
	FEATURE_UNLIMITED_EMAILS,
	FEATURE_UNLIMITED_POSTS_PAGES,
	FEATURE_UNLIMITED_PRODUCTS_SERVICES,
	FEATURE_UNLIMITED_STORAGE,
	FEATURE_UNLIMITED_SUBSCRIBERS,
	FEATURE_UNLIMITED_TRAFFIC,
	FEATURE_UNLIMITED_USERS,
	FEATURE_UPLOAD_PLUGINS,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	FEATURE_VIDEO_UPLOADS,
	FEATURE_WAF_V2,
	FEATURE_WAF,
	FEATURE_WOO_AUTOMATE,
	FEATURE_WOO_SHIPPING_TRACKING,
	FEATURE_WOOCOMMERCE_MOBILE_APP,
	FEATURE_WOOCOMMERCE_STORE,
	FEATURE_WOOCOMMERCE,
	FEATURE_WORDADS_INSTANT,
	FEATURE_WORDADS,
	FEATURE_WORDPRESS_CMS,
	FEATURE_WORDPRESS_MOBILE_APP,
	FEATURE_WP_SUBDOMAIN_SIGNUP,
	FEATURE_WP_SUBDOMAIN,
	GoogleWorkspaceSlugs,
	PREMIUM_DESIGN_FOR_STORES,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	WPCOM_FEATURES_BACKUPS_RESTORE,
	WPCOM_FEATURES_NO_ADVERTS,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
} from '@automattic/api-core';
import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { formatNumber } from '@automattic/number-formatters';
import { DOMAIN_PRICING_AND_AVAILABLE_TLDS } from '@automattic/urls';
import { ExternalLink, ProgressBar } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf, hasTranslation } from '@wordpress/i18n';
import { formatRelative } from 'date-fns';
import { isJetpackPlanSlug, getPlanFeaturesAndAvailability } from './plans';
import {
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackBoostSlug,
} from './purchase';
import type {
	BackupEntry,
	DotcomFeatureSlug,
	HostingFeatureSlug,
	JetpackFeatureSlug,
	JetpackModuleSlug,
	Site,
	SiteScan,
	SiteScanCounts,
} from '@automattic/api-core';

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;

// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

export type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => TranslateResult;
	getDescription?: ( params?: { domainName?: string } ) => TranslateResult;
	getFeatureGroup?: () => string;
	getStoreSlug?: () => string;
	isPlan?: boolean;
};

type FeatureList = Record< string, FeatureObject >;
/**
 * Get all features for a plan
 *
 * Collects features for a plan by calling all possible feature methods for the plan.
 *
 * Returns an array of all the plan features (may have duplicates)
 */
function getAllFeaturesForPlan( plan: string ): TranslateResult[] {
	const planObj = getPlanFeaturesAndAvailability( plan );
	if ( ! planObj ) {
		return [];
	}
	const feats = [
		...( 'getPlanCompareFeatures' in planObj && planObj.getPlanCompareFeatures
			? planObj.getPlanCompareFeatures()
			: [] ),
		...( 'getPromotedFeatures' in planObj && planObj.getPromotedFeatures
			? planObj.getPromotedFeatures()
			: [] ),
		...( 'getSignupFeatures' in planObj && planObj.getSignupFeatures
			? planObj.getSignupFeatures()
			: [] ),
		...( 'getSignupCompareAvailableFeatures' in planObj && planObj.getSignupCompareAvailableFeatures
			? planObj.getSignupCompareAvailableFeatures()
			: [] ),
		...( 'getBlogSignupFeatures' in planObj && planObj.getBlogSignupFeatures
			? planObj.getBlogSignupFeatures()
			: [] ),
		...( 'getPortfolioSignupFeatures' in planObj && planObj.getPortfolioSignupFeatures
			? planObj.getPortfolioSignupFeatures()
			: [] ),
		...( 'getIncludedFeatures' in planObj && planObj.getIncludedFeatures
			? planObj.getIncludedFeatures()
			: [] ),
	];
	return feats;
}

/**
 * Determines if a plan has a specific feature.
 *
 * Collects features for a plan by calling all possible feature methods for the plan.
 */
//used
export function planHasFeature( plan: string, feature: string ): boolean {
	const allFeatures = getAllFeaturesForPlan( plan );
	return allFeatures.includes( feature );
}

/**
 * Determine if a plan has at least one of several features.
 */
//used
export function planHasAtLeastOneFeature( plan: string, features: string[] ): boolean {
	const allFeatures = getAllFeaturesForPlan( plan );
	return features.some( ( feature ) => allFeatures.includes( feature ) );
}

// Returns whether the plan supports a specific feature.
export function hasPlanFeature(
	site: Site,
	feature: `${ DotcomFeatureSlug | JetpackFeatureSlug }`
) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

// Returns whether the plan supports a specific "hosting feature",
// which is a feature that requires Atomic or self-hosted infrastructure.
export function hasHostingFeature( site: Site, feature: HostingFeatureSlug ) {
	if ( hasPlanFeature( site, DotcomFeatures.ATOMIC ) ) {
		if ( site.plan?.expired || ! site.is_wpcom_atomic ) {
			return false;
		}
	}
	return hasPlanFeature( site, feature );
}

export function hasJetpackModule( site: Site, module: `${ JetpackModuleSlug }` ) {
	return site.jetpack && site.jetpack_modules?.includes( module );
}

//used
export const productHasAntiSpam = ( productSlug: string ): boolean => {
	const ANTISPAM_FEATURES = [ FEATURE_JETPACK_ANTI_SPAM, FEATURE_JETPACK_ANTI_SPAM_MONTHLY ];

	// check that this product is standalone anti-spam or one of the plans that contains it
	return (
		// standalone anti-spam product
		isJetpackAntiSpamSlug( productSlug ) ||
		// check plans for anti-spam features
		( isJetpackPlanSlug( productSlug ) &&
			planHasAtLeastOneFeature( productSlug, ANTISPAM_FEATURES ) )
	);
};

//used
export const productHasBackups = ( productSlug: string ): boolean => {
	const BACKUP_FEATURES = [
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
		FEATURE_JETPACK_BACKUP_REALTIME,
		FEATURE_JETPACK_BACKUP_T1_MONTHLY,
		FEATURE_JETPACK_BACKUP_T1_YEARLY,
		FEATURE_JETPACK_BACKUP_T2_MONTHLY,
		FEATURE_JETPACK_BACKUP_T2_YEARLY,
	];

	return (
		// standalone backup product
		isJetpackBackupSlug( productSlug ) ||
		// check plans for Jetpack backup features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, BACKUP_FEATURES ) )
	);
};

/**
 * Checks if the product has Boost features
 */
//used
export const productHasBoost = ( productSlug: string ): boolean => {
	return (
		// If the product is a standalone Boost product
		isJetpackBoostSlug( productSlug ) ||
		// If Boost is included in the plan
		( isJetpackPlanSlug( productSlug ) &&
			planHasAtLeastOneFeature( productSlug, [ FEATURE_CLOUD_CRITICAL_CSS ] ) )
	);
};

//used
export const productHasScan = ( productSlug: string ): boolean => {
	const SCAN_FEATURES = [ FEATURE_JETPACK_SCAN_DAILY, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ];

	return (
		// standalone scan product
		isJetpackScanSlug( productSlug ) ||
		// check plans for Jetpack scan features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, SCAN_FEATURES ) )
	);
};

//used
export const productHasSearch = ( productSlug: string ): boolean => {
	const SEARCH_FEATURES = [
		FEATURE_JETPACK_SEARCH,
		FEATURE_JETPACK_SEARCH_MONTHLY,

		// This is a bit obscure -- checks specifically for Jetpack Business (Professional).
		// Is it an error that the plan spec in plans-list.js does not contain search features?
		FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	];

	return (
		// standalone search product
		isJetpackSearchSlug( productSlug ) ||
		// check plans for Jetpack search features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, SEARCH_FEATURES ) )
	);
};

/**
 * Checks if the product IS Jetpack VideoPress, or if it contains Jetpack VideoPress as a feature.
 * @param productSlug The product slug
 * @returns whether or not the product has VideoPress.
 */
//used
export const productHasVideoPress = ( productSlug: string ): boolean => {
	return (
		planHasAtLeastOneFeature( productSlug, [
			FEATURE_JETPACK_VIDEOPRESS,
			FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
		] ) ||
		[ PRODUCT_JETPACK_VIDEOPRESS, PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ].includes( productSlug )
	);
};

const getTransactionFeeCopy = ( commission = 0, variation = '' ) => {
	switch ( variation ) {
		case 'woo':
			return createInterpolateElement(
				sprintf(
					/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
					__(
						'%(commission)d%% transaction fee for standard WooCommerce payments <br></br>(+ standard processing fee)'
					),
					{ commission }
				),
				{ br: <br /> }
			);

		case 'all':
			return createInterpolateElement(
				sprintf(
					/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
					__(
						'%(commission)d%% transaction fee for all payment features <br></br>(+ standard processing fee)'
					),
					{ commission }
				),
				{ br: <br /> }
			);

		case 'regular':
			return createInterpolateElement(
				sprintf(
					/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
					__(
						'%(commission)d%% transaction fee for standard payments <br></br>(+ standard processing fee)'
					),
					{ commission }
				),
				{ br: <br /> }
			);

		default:
			return createInterpolateElement(
				sprintf(
					/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
					__(
						'%(commission)d%% transaction fee for payments <br></br>(+ standard processing fee)'
					),
					{ commission }
				),
				{ br: <br /> }
			);
	}
};

export const FEATURES_LIST: FeatureList = /*( () =>*/ {
	//return {
	[ FEATURE_BLANK ]: {
		getSlug: () => FEATURE_BLANK,
		getTitle: () => '',
	},

	[ FEATURE_ALL_FREE_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES_JETPACK,
		getTitle: () =>
			createInterpolateElement( __( '<a>All free features</a>' ), {
				a: <ExternalLink children={ null } href="https://jetpack.com/features/comparison" />,
			} ),
		getDescription: () =>
			__( 'Also includes all features offered in the free version of Jetpack.' ),
	},

	[ FEATURE_ALL_FREE_FEATURES ]: {
		getSlug: () => FEATURE_ALL_FREE_FEATURES,
		getTitle: () => __( 'All free features' ),
		getDescription: () => __( 'Also includes all features offered in the free plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES_JETPACK,
		getTitle: () =>
			createInterpolateElement( __( '<a>All Personal features</a>' ), {
				a: <ExternalLink children={ null } href="https://jetpack.com/features/comparison" />,
			} ),
		getDescription: () => __( 'Also includes all features offered in the Personal plan.' ),
	},

	[ FEATURE_ALL_PERSONAL_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PERSONAL_FEATURES,
		getTitle: () => __( 'All Personal features' ),
		getDescription: () =>
			__(
				'Including email and live chat support, an ad-free experience for your visitors, increased storage space, and a custom domain name for one year.'
			),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES_JETPACK ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
		getTitle: () =>
			createInterpolateElement( __( '<a>All Premium features</a>' ), {
				a: <ExternalLink children={ null } href="https://jetpack.com/features/comparison" />,
			} ),
		getDescription: () => __( 'Also includes all features offered in the Premium plan.' ),
	},

	[ FEATURE_ALL_PREMIUM_FEATURES ]: {
		getSlug: () => FEATURE_ALL_PREMIUM_FEATURES,
		getTitle: () => __( 'All Premium features' ),
		getDescription: () => {
			return isEnabled( 'themes/premium' )
				? __(
						'Including premium themes, advanced design and monetization options, PayPal Payment Buttons, and a custom domain name for one year.'
				  )
				: __(
						'Including advanced design and monetization options, PayPal Payment Buttons, and a custom domain name for one year.'
				  );
		},
	},

	[ FEATURE_ADVANCED_DESIGN_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_ADVANCED_DESIGN_CUSTOMIZATION,
		getTitle: () => __( 'Advanced design customization' ),
		getDescription: () =>
			__(
				'Access extended color schemes, backgrounds, and CSS, giving you complete control over how your site looks.'
			),
	},

	[ FEATURE_FREE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_BLOG_DOMAIN,
		getTitle: () => __( 'Free .blog domain for one year' ),
		getDescription: () =>
			__(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			),
	},

	[ FEATURE_FREE_DOMAIN ]: {
		getSlug: () => FEATURE_FREE_DOMAIN,
		getTitle: () => __( 'Free domain for one year' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'All paid WordPress.com plans purchased for an annual term include one year of free domain registration. ' +
						'Domains registered through this promotion will renew at our <a>standard rate</a>, plus applicable taxes, after the first year.<br /><br />' +
						'This offer is redeemable one time only, and does not apply to plan upgrades, renewals, or premium domains.'
				),
				{
					a: (
						<a
							href={ localizeUrl( DOMAIN_PRICING_AND_AVAILABLE_TLDS ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
					br: <br />,
				}
			),
	},

	[ FEATURE_HOSTING ]: {
		getSlug: () => FEATURE_HOSTING,
		getTitle: () => __( 'Best-in-class hosting' ),
		getDescription: () =>
			__(
				'Site hosting is included with your plan, eliminating additional cost and technical hassle.'
			),
	},

	[ FEATURE_PREMIUM_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_THEMES,
		getTitle: () => __( 'Premium themes' ),
		getDescription: () => __( 'Switch between a collection of premium design themes.' ),
	},

	[ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ]: {
		getSlug: () => WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
		getTitle: () => __( 'All premium themes' ),
		getDescription: () => {
			return __( 'Switch between all of our premium design themes.' );
		},
	},

	[ FEATURE_MONETISE ]: {
		getSlug: () => FEATURE_MONETISE,
		getTitle: () => __( 'Monetize your site with ads' ),
		getDescription: () =>
			__(
				'Add advertising to your site through our WordAds program and earn money from impressions.'
			),
	},

	[ FEATURE_EARN_AD ]: {
		getSlug: () => FEATURE_EARN_AD,
		getTitle: () => __( 'Earn ad revenue' ),
	},

	[ FEATURE_UPLOAD_THEMES_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES_PLUGINS,
		getTitle: () => __( 'Upload themes and plugins' ),
		getDescription: () => __( 'Upload custom themes and plugins on your site.' ),
	},

	[ FEATURE_FREE_THEMES_SIGNUP ]: {
		getSlug: () => FEATURE_FREE_THEMES_SIGNUP,
		getTitle: () => __( 'Dozens of free themes' ),
		getDescription: () =>
			__(
				"Access to a wide range of professional themes so you can find a design that's just right for your site."
			),
	},

	[ FEATURE_WP_SUBDOMAIN_SIGNUP ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN_SIGNUP,
		getTitle: () => __( 'WordPress.com subdomain' ),
		getDescription: () =>
			__( 'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).' ),
	},
	[ FEATURE_ADVANCED_SEO_TOOLS ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_TOOLS,
		getTitle: () => __( 'Advanced SEO tools' ),
		getDescription: () =>
			__(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_ADVANCED_SEO_EXPANDED_ABBR ]: {
		getSlug: () => FEATURE_ADVANCED_SEO_EXPANDED_ABBR,
		getTitle: () => __( 'Advanced SEO (Search Engine Optimisation) tools' ),
	},
	[ FEATURE_FREE_WORDPRESS_THEMES ]: {
		getSlug: () => FEATURE_FREE_WORDPRESS_THEMES,
		getTitle: () => __( 'Free WordPress Themes' ),
	},
	[ FEATURE_SEO_PREVIEW_TOOLS ]: {
		getSlug: () => FEATURE_SEO_PREVIEW_TOOLS,
		getTitle: () => __( 'SEO tools' ),
		getDescription: () =>
			__(
				'Edit your page titles and meta descriptions, and preview how your content will appear on social media.'
			),
	},

	[ FEATURE_GOOGLE_ANALYTICS ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS,
		getTitle: () => __( 'Google Analytics integration' ),
		getDescription: () =>
			__(
				"Track your site's stats with Google Analytics for a " +
					'deeper understanding of your visitors and customers.'
			),
	},

	[ FEATURE_GOOGLE_MY_BUSINESS ]: {
		getSlug: () => FEATURE_GOOGLE_MY_BUSINESS,
		getTitle: () => __( 'Google Business Profile' ),
		getDescription: () =>
			__(
				'See how customers find you on Google -- and whether they visited your site ' +
					'and looked for more info on your business -- by connecting to a Google Business Profile location.'
			),
	},

	[ FEATURE_UNLIMITED_STORAGE ]: {
		getSlug: () => FEATURE_UNLIMITED_STORAGE,
		getTitle: () =>
			createInterpolateElement( __( '<strong>200 GB</strong> storage space' ), {
				strong: <strong />,
			} ),
		getDescription: () => __( 'Upload more images, videos, audio, and documents to your website.' ),
		getStoreSlug: () => 'unlimited_space',
	},

	[ FEATURE_BLOG_DOMAIN ]: {
		getSlug: () => FEATURE_BLOG_DOMAIN,
		getTitle: () => __( 'Free .blog Domain for one year' ),
		getDescription: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return sprintf(
					/* translators: (%s) is a domain name */
					__( 'Your domain (%s) is included with this plan.' ),
					{
						domainName,
					}
				);
			}

			return __(
				'Get a free custom .blog domain for one year. Premium domains not included. Your domain will renew at its regular price.'
			);
		},
	},

	[ FEATURE_CUSTOM_DOMAIN ]: {
		getSlug: () => FEATURE_CUSTOM_DOMAIN,
		getTitle: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return sprintf(
					/* translators: %(domainName)s is a domain name */ __( '%(domainName)s is included' ),
					{
						domainName,
					}
				);
			}

			return __( 'Free domain for one year' );
		},
		getDescription: ( { domainName = undefined } = {} ) => {
			if ( domainName ) {
				return sprintf(
					/* translators: (%s) is a domain name */
					__( 'Your domain (%s) is included with this plan.' ),
					{
						domainName,
					}
				);
			}

			return createInterpolateElement(
				__( 'Get a custom domain – like <i>yourgroovydomain.com</i> – free for the first year.' ),
				{
					i: <i />,
				}
			);
		},
	},

	[ FEATURE_JETPACK_ESSENTIAL ]: {
		getSlug: () => FEATURE_JETPACK_ESSENTIAL,
		getTitle: () => __( 'Jetpack essential features' ),
		getDescription: () =>
			__( 'Optimize your site for better SEO, faster-loading pages, and protection from spam.' ),
	},

	[ FEATURE_JETPACK_ADVANCED ]: {
		getSlug: () => FEATURE_JETPACK_ADVANCED,
		getTitle: () => __( 'Jetpack advanced features' ),
		getDescription: () =>
			__(
				'Speed up your site’s performance and protect it from spammers. ' +
					'Access detailed records of all activity on your site and restore your site ' +
					'to a previous point in time with just a click! While you’re at it, ' +
					'improve your SEO with our Advanced SEO tools and automate social media sharing.'
			),
	},

	[ FEATURE_VIDEO_UPLOADS ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS,
		getTitle: () => __( 'VideoPress support' ),
		getDescription: () =>
			__(
				'The easiest way to upload videos to your website and display them ' +
					'using a fast, unbranded, customizable player with rich stats.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_VIDEO_UPLOADS_JETPACK_PRO ]: {
		getSlug: () => FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
		getTitle: () =>
			createInterpolateElement( __( '<strong>Unlimited</strong> Video hosting' ), {
				strong: <strong />,
			} ),
		getDescription: () =>
			__(
				'Easy video uploads, and a fast, unbranded, customizable video player,' +
					'enhanced with rich stats and unlimited storage space.'
			),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_AUDIO_UPLOADS ]: {
		getSlug: () => FEATURE_AUDIO_UPLOADS,
		getTitle: () => __( 'Audio upload support' ),
		getDescription: () =>
			__( 'The easiest way to upload audio files that use any major audio file format.' ),
		getStoreSlug: () => 'videopress',
	},

	[ FEATURE_NO_ADS ]: {
		getSlug: () => WPCOM_FEATURES_NO_ADVERTS,
		getTitle: () => __( 'Remove WordPress.com ads' ),
		getDescription: () =>
			__(
				'Allow your visitors to visit and read your website without ' +
					'seeing any WordPress.com advertising.'
			),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},
	[ FEATURE_REPUBLICIZE ]: {
		getSlug: () => FEATURE_REPUBLICIZE,
		getTitle: () => __( 'Advanced social media' ),
		getDescription: () =>
			__(
				"Schedule your social media updates in advance and promote your posts when it's best for you."
			),
	},
	[ FEATURE_SIMPLE_PAYMENTS ]: {
		getSlug: () => FEATURE_SIMPLE_PAYMENTS,
		getTitle: () => __( 'PayPal Payment Buttons' ),
		getDescription: () => __( 'Sell anything with a simple PayPal button.' ),
	},
	[ FEATURE_NO_BRANDING ]: {
		getSlug: () => FEATURE_NO_BRANDING,
		getTitle: () => __( 'Remove WordPress.com branding' ),
		getDescription: () =>
			__( "Keep the focus on your site's brand by removing the WordPress.com footer branding." ),
		getStoreSlug: () => 'no-adverts/no-adverts.php',
	},

	[ FEATURE_ADVANCED_SEO ]: {
		getSlug: () => FEATURE_ADVANCED_SEO,
		getTitle: () => __( 'SEO tools' ),
		getDescription: () =>
			__(
				'Boost traffic to your site with tools that make your content more findable on search engines and social media.'
			),
	},

	[ FEATURE_UPLOAD_PLUGINS ]: {
		getSlug: () => FEATURE_UPLOAD_PLUGINS,
		getTitle: () => __( 'Install plugins' ),
		getDescription: () =>
			__(
				'Plugins extend the functionality of your site and ' +
					'open up endless possibilities for presenting your content and interacting with visitors.'
			),
	},

	[ FEATURE_INSTALL_PLUGINS ]: {
		getSlug: () => FEATURE_INSTALL_PLUGINS,
		getTitle: () =>
			__( 'Access to more than 50,000 WordPress plugins to extend functionality for your site' ),
	},

	[ FEATURE_UPLOAD_THEMES ]: {
		getSlug: () => FEATURE_UPLOAD_THEMES,
		getTitle: () => __( 'Install themes' ),
		getDescription: () =>
			__(
				'With the option to upload themes, you can give your site a professional polish ' +
					'that will help it stand out among the rest.'
			),
	},

	[ FEATURE_WORDADS_INSTANT ]: {
		getSlug: () => FEATURE_WORDADS_INSTANT,
		getTitle: () => __( 'Site monetization' ),
		getDescription: () =>
			__( 'Earn money on your site by displaying ads and collecting payments or donations.' ),
	},

	[ FEATURE_WP_SUBDOMAIN ]: {
		getSlug: () => FEATURE_WP_SUBDOMAIN,
		getTitle: () => __( 'WordPress.com subdomain' ),
		getDescription: () =>
			__( 'Your site address will use a WordPress.com subdomain (sitename.wordpress.com).' ),
	},

	[ FEATURE_FREE_THEMES ]: {
		getSlug: () => FEATURE_FREE_THEMES,
		getTitle: () => __( 'Dozens of free themes' ),
		getDescription: () =>
			__(
				'Access to a wide range of professional themes ' +
					"so you can find a design that's just right for your site."
			),
	},

	[ FEATURE_1GB_STORAGE ]: {
		getSlug: () => FEATURE_1GB_STORAGE,
		getTitle: () => __( '1GB' ),
		getDescription: () => __( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_3GB_STORAGE ]: {
		getSlug: () => FEATURE_3GB_STORAGE,
		getTitle: () => __( '3 GB' ),
		getDescription: () => __( 'Storage space for adding images and documents to your website.' ),
	},

	[ FEATURE_6GB_STORAGE ]: {
		getSlug: () => FEATURE_6GB_STORAGE,
		getTitle: () => __( '6 GB' ),
		getDescription: () => __( 'Upload more images, audio, and documents to your website.' ),
	},

	[ FEATURE_13GB_STORAGE ]: {
		getSlug: () => FEATURE_13GB_STORAGE,
		getTitle: () => __( '13 GB' ),
		getDescription: () => __( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_50GB_STORAGE ]: {
		getSlug: () => FEATURE_50GB_STORAGE,
		getTitle: () => __( '50 GB' ),
		getDescription: () => __( 'Storage space for adding images and documents to your website.' ),
	},

	// TODO: Consider removing this because it is no longer standard on any plans
	[ FEATURE_200GB_STORAGE ]: {
		getSlug: () => FEATURE_200GB_STORAGE,
		getTitle: () => __( '200 GB' ),
		getDescription: () => __( 'Upload more images, videos, audio, and documents to your website.' ),
	},

	[ FEATURE_COMMUNITY_SUPPORT ]: {
		getSlug: () => FEATURE_COMMUNITY_SUPPORT,
		getTitle: () => __( 'Community support' ),
		getDescription: () => __( 'Get support through our ' + 'user community forums.' ),
	},

	[ FEATURE_PREMIUM_SUPPORT ]: {
		getSlug: () => FEATURE_PREMIUM_SUPPORT,
		getTitle: () => __( 'Priority Support' ),
		getDescription: () => __( 'Realtime help and guidance from professional WordPress experts.' ),
	},

	[ FEATURE_STANDARD_SECURITY_TOOLS ]: {
		getSlug: () => FEATURE_STANDARD_SECURITY_TOOLS,
		getTitle: () => __( 'Standard security tools' ),
		getDescription: () =>
			__(
				'Brute force protection, downtime monitoring, secure sign on, ' +
					'and automatic updates for your plugins.'
			),
	},
	[ FEATURE_SITE_STATS ]: {
		getSlug: () => FEATURE_SITE_STATS,
		getTitle: () => __( 'Jetpack Stats' ),
		getDescription: () => __( 'The most important metrics for your site.' ),
	},
	[ FEATURE_TRAFFIC_TOOLS ]: {
		getSlug: () => FEATURE_TRAFFIC_TOOLS,
		getTitle: () => __( 'Traffic and Promotion Tools' ),
		getDescription: () =>
			__( 'Build and engage your audience with more than a dozen optimization tools.' ),
	},
	[ FEATURE_MANAGE ]: {
		getSlug: () => FEATURE_MANAGE,
		getTitle: () => __( 'Centralized Dashboard' ),
		getDescription: () => __( 'Manage all of your WordPress sites from one location.' ),
	},
	[ FEATURE_SPAM_AKISMET_PLUS ]: {
		getSlug: () => FEATURE_SPAM_AKISMET_PLUS,
		getTitle: () => __( 'Spam Protection' ),
		getDescription: () => __( 'State-of-the-art spam defense, powered by Akismet.' ),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
		getTitle: () =>
			createInterpolateElement( __( '<strong>Daily</strong> backups' ), {
				strong: <strong />,
			} ),
		getDescription: () =>
			__(
				'Automatic daily backups of your entire site, with ' +
					'unlimited, WordPress-optimized secure storage.'
			),
	},
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME ]: {
		getSlug: () => FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME,
		getTitle: () =>
			createInterpolateElement( __( '<strong>Real-time</strong> backups' ), {
				strong: <strong />,
			} ),
		getDescription: () =>
			__(
				'Automatic real-time backups of every single aspect of your site. ' +
					'Stored safely and optimized for WordPress.'
			),
	},
	[ FEATURE_BACKUP_ARCHIVE_30 ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_30,
		getTitle: () => __( '30-day backup archive' ),
		getDescription: () => __( 'Browse or restore any backup made within the past 30 days.' ),
	},
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_ARCHIVE_UNLIMITED,
		getTitle: () => __( 'Unlimited backup archive' ),
		getDescription: () =>
			__( 'Browse or restore any backup made since you activated the service.' ),
	},

	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: {
		getSlug: () => FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
		getTitle: () => __( 'Unlimited backup storage space' ),
		getDescription: () => __( 'Absolutely no limits on storage space for your backups.' ),
	},

	[ FEATURE_AUTOMATED_RESTORES ]: {
		getSlug: () => FEATURE_AUTOMATED_RESTORES,
		getTitle: () => __( 'Automated restores' ),
		getDescription: () => __( 'Restore your site from any available backup with a single click.' ),
	},
	[ FEATURE_EASY_SITE_MIGRATION ]: {
		getSlug: () => FEATURE_EASY_SITE_MIGRATION,
		getTitle: () => __( 'Easy site migration' ),
		getDescription: () => __( 'Easily and quickly move or duplicate your site to any location.' ),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY,
		getTitle: () =>
			createInterpolateElement( __( '<strong>Daily</strong> malware scanning' ), {
				strong: <strong />,
			} ),
		getDescription: () =>
			__(
				'Comprehensive, automated scanning for security vulnerabilities or threats on your site.'
			),
	},
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: {
		getSlug: () => FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
		getTitle: () => __( 'Daily and on-demand malware scanning' ),
		getDescription: () =>
			__( 'Automated security scanning with the option to run complete site scans at any time.' ),
	},
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: {
		getSlug: () => FEATURE_ONE_CLICK_THREAT_RESOLUTION,
		getTitle: () => __( 'One-click threat resolution' ),
		getDescription: () =>
			__( 'Repair any security issues found on your site with just a single click.' ),
	},
	[ FEATURE_AUTOMATIC_SECURITY_FIXES ]: {
		getSlug: () => FEATURE_AUTOMATIC_SECURITY_FIXES,
		getTitle: () =>
			createInterpolateElement( __( '<strong>Automatic</strong> security fixes' ), {
				strong: <strong />,
			} ),
		getDescription: () =>
			__(
				'Automated and immediate resolution for a large percentage of known security vulnerabilities or threats.'
			),
	},
	[ FEATURE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG,
		getTitle: () => __( 'Expanded site activity' ),
		getDescription: () =>
			__(
				'Take the guesswork out of site management and debugging with a filterable record of all the activity happening on your site.'
			),
	},
	[ FEATURE_SITE_BACKUPS_AND_RESTORE ]: {
		getSlug: () => FEATURE_SITE_BACKUPS_AND_RESTORE,
		getTitle: () => __( 'Automated site backups and one-click restore' ),
	},
	[ FEATURE_ACCEPT_PAYMENTS ]: {
		getSlug: () => FEATURE_ACCEPT_PAYMENTS,
		getTitle: () => __( 'Accept payments in 60+ countries' ),
		getDescription: () =>
			__(
				'Built-in payment processing from leading providers like Stripe, PayPal, and more. Accept payments from customers all over the world.'
			),
	},

	[ FEATURE_SHIPPING_CARRIERS ]: {
		getSlug: () => FEATURE_SHIPPING_CARRIERS,
		getTitle: () => __( 'Integrations with top shipping carriers' ),
		getDescription: () =>
			__(
				'Ship physical products in a snap and show live rates from shipping carriers like UPS and other shipping options.'
			),
	},

	[ FEATURE_UNLIMITED_PRODUCTS_SERVICES ]: {
		getSlug: () => FEATURE_UNLIMITED_PRODUCTS_SERVICES,
		getTitle: () => __( 'Unlimited products or services' ),
		getDescription: () =>
			__(
				'Grow your store as big as you want with the ability to add and sell unlimited products and services.'
			),
	},

	[ FEATURE_ECOMMERCE_MARKETING ]: {
		getSlug: () => FEATURE_ECOMMERCE_MARKETING,
		getTitle: () => __( 'eCommerce marketing tools' ),
		getDescription: () =>
			__(
				'Optimize your store for sales by adding in email and social integrations with Facebook and Mailchimp, and more.'
			),
	},

	[ FEATURE_PREMIUM_CUSTOMIZABE_THEMES ]: {
		getSlug: () => FEATURE_PREMIUM_CUSTOMIZABE_THEMES,
		getTitle: () => __( 'Premium customizable starter themes' ),
		getDescription: () =>
			__(
				'Quickly get up and running with a beautiful store theme and additional design options that you can easily make your own.'
			),
	},

	[ FEATURE_ALL_BUSINESS_FEATURES ]: {
		getSlug: () => FEATURE_ALL_BUSINESS_FEATURES,
		getTitle: () => __( 'All Business features' ),
		getDescription: () =>
			__(
				'Including the ability to upload plugins and themes, priority support and advanced monetization options.'
			),
	},

	[ FEATURE_MEMBERSHIPS ]: {
		getSlug: () => FEATURE_MEMBERSHIPS,
		getTitle: () => __( 'Payments' ),
		getDescription: () => __( 'Accept one-time, monthly, or annual payments on your website.' ),
	},

	[ FEATURE_PREMIUM_CONTENT_BLOCK ]: {
		getSlug: () => FEATURE_PREMIUM_CONTENT_BLOCK,
		getTitle: () => __( 'Subscriber-only content' ),
		getDescription: () =>
			__(
				'Create additional, premium content that you can make available to paying subscribers only.'
			),
	},

	[ FEATURE_PLAN_SECURITY_DAILY ]: {
		getSlug: () => FEATURE_PLAN_SECURITY_DAILY,
		getTitle: () => __( 'All Security Daily features' ),
		isPlan: true,
	},
	[ FEATURE_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_BACKUP_DAILY_V2,
		getTitle: () => __( 'Automated daily backups (off-site)' ),
	},

	[ FEATURE_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_BACKUP_REALTIME_V2,
		getTitle: () => __( 'VaultPress Backup (real-time, off-site)' ),
	},
	[ FEATURE_PRODUCT_BACKUP_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_DAILY_V2,
		getTitle: () => __( 'All VaultPress Backup Daily features' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'Automatic daily backups of your entire site, with unlimited, WordPress-optimized secure storage. <link>Learn more</link>.'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpack.com/upgrade/backup/" />,
				}
			),
	},

	[ FEATURE_PRODUCT_BACKUP_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_BACKUP_REALTIME_V2,
		getTitle: () => __( 'VaultPress Backup Real-time (off-site)' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'Real-time backups of your entire site and database with unlimited secure storage. <link>Learn more</link>.'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpack.com/upgrade/backup/" />,
				}
			),
	},

	[ FEATURE_SCAN_V2 ]: {
		getSlug: () => FEATURE_SCAN_V2,
		getTitle: () => __( 'Automated daily scanning' ),
	},

	// * Scan Daily *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_DAILY_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_DAILY_V2,
		getTitle: () => __( 'Scan (daily, automated)' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'Automated daily scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. <link>Learn more</link>.'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpack.com/upgrade/scan/" />,
				}
			),
	},

	// * Scan Real-time *
	// Currently we're not distinguishing between Scan 'Daily' or 'Real-time',
	// but leaving this here because we may be implementing Scan 'Daily' and 'Real-time'
	// in the near future.
	[ FEATURE_PRODUCT_SCAN_REALTIME_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SCAN_REALTIME_V2,
		getTitle: () => __( 'Scan (real-time, automated)' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'Automated real-time scanning for security vulnerabilities or threats on your site. Includes instant notifications and automatic security fixes. <link>Learn more</link>.'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpack.com/upgrade/scan/" />,
				}
			),
	},

	[ FEATURE_ANTISPAM_V2 ]: {
		getSlug: () => FEATURE_ANTISPAM_V2,
		getTitle: () => __( 'Comment and form spam protection' ),
	},

	[ FEATURE_WAF ]: {
		getSlug: () => FEATURE_WAF,
		getTitle: () =>
			/* translators: WAF stands for Web Application Firewall */
			__( 'Website firewall (WAF beta)' ),
	},

	[ FEATURE_ACTIVITY_LOG_1_YEAR_V2 ]: {
		getSlug: () => FEATURE_ACTIVITY_LOG_1_YEAR_V2,
		getTitle: () => __( 'Activity log: 1-year archive' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'View every change to your site in the last year. Pairs with VaultPress Backup to restore your site to any earlier version. <link>Learn more.</link>'
				),
				{
					link: (
						<ExternalLink
							children={ null }
							href="https://jetpack.com/features/security/activity-log/"
						/>
					),
				}
			),
	},

	[ FEATURE_PRODUCT_SEARCH_V2 ]: {
		getSlug: () => FEATURE_PRODUCT_SEARCH_V2,
		getTitle: () => __( 'Site Search up to 100k records and 100k requests/mo.' ),

		getDescription: () =>
			createInterpolateElement(
				__(
					'Help your site visitors find answers instantly so they keep reading and buying. Powerful filtering and customization options. <link>Learn more.</link>'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpack.com/upgrade/search/" />,
				}
			),
	},

	[ FEATURE_CRM_V2 ]: {
		getSlug: () => FEATURE_CRM_V2,
		getTitle: () => __( 'CRM Entrepreneur' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'The most simple and powerful WordPress CRM. Improve customer relationships and increase profits. <link>Learn more</link>.'
				),
				{
					link: <ExternalLink children={ null } href="https://jetpackcrm.com" />,
				}
			),
	},

	[ FEATURE_COLLECT_PAYMENTS_V2 ]: {
		getSlug: () => FEATURE_COLLECT_PAYMENTS_V2,
		getTitle: () => __( 'Collect payments' ),
		getDescription: () =>
			createInterpolateElement(
				__(
					'Accept payments from credit or debit cards via Stripe. Sell products, collect donations, and set up recurring payments for subscriptions or memberships. <link>Learn more</link>.'
				),
				{
					link: (
						<ExternalLink
							children={ null }
							href="https://jetpack.com/support/jetpack-blocks/payments-block/"
						/>
					),
				}
			),
	},
	[ WPCOM_FEATURES_BACKUPS_RESTORE ]: {
		getSlug: () => WPCOM_FEATURES_BACKUPS_RESTORE,
		getTitle: () => __( 'Real time full-site backup/restore' ),
		getDescription: () =>
			__(
				'Comprehensive real-time backups of your entire site with instant one-click restore capabilities.'
			),
	},

	[ FEATURE_P2_3GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_3GB_STORAGE,
		getTitle: () =>
			createInterpolateElement( __( '<strong>3GB</strong> storage space' ), {
				strong: <strong />,
			} ),
		getDescription: () => __( 'Upload images and documents and share them with your team.' ),
	},

	[ FEATURE_P2_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_USERS,
		getTitle: () => __( 'Unlimited users' ),
		getDescription: () => __( 'Invite as many people as you need to your P2.' ),
	},

	[ FEATURE_P2_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_P2_UNLIMITED_POSTS_PAGES,
		getTitle: () => __( 'Unlimited posts and pages' ),
		getDescription: () =>
			__( 'Communicate as often as you want, with full access to your archive.' ),
	},

	[ FEATURE_P2_SIMPLE_SEARCH ]: {
		getSlug: () => FEATURE_P2_SIMPLE_SEARCH,
		getTitle: () => __( 'Simple search' ),
		getDescription: () => __( 'Easily find what you’re looking for.' ),
	},

	[ FEATURE_P2_CUSTOMIZATION_OPTIONS ]: {
		getSlug: () => FEATURE_P2_CUSTOMIZATION_OPTIONS,
		getTitle: () => __( 'Customization options' ),
		getDescription: () => __( 'Make your team feel at home with some easy customization options.' ),
	},

	[ FEATURE_P2_13GB_STORAGE ]: {
		getSlug: () => FEATURE_P2_13GB_STORAGE,
		getTitle: () =>
			createInterpolateElement( __( '<strong>13GB</strong> storage space' ), {
				strong: <strong />,
			} ),
		getDescription: () => __( 'Upload more files to your P2.' ),
	},

	[ FEATURE_P2_ADVANCED_SEARCH ]: {
		getSlug: () => FEATURE_P2_ADVANCED_SEARCH,
		getTitle: () => __( 'Advanced search' ),
		getDescription: () =>
			__(
				'A faster and more powerful search engine to make finding what you’re looking for easier.'
			),
	},

	[ FEATURE_P2_VIDEO_SHARING ]: {
		getSlug: () => FEATURE_P2_VIDEO_SHARING,
		getTitle: () => __( 'Easy video sharing' ),
		getDescription: () =>
			__(
				'Upload videos directly to your P2 for your team to see, without depending on external services.'
			),
	},

	[ FEATURE_P2_MORE_FILE_TYPES ]: {
		getSlug: () => FEATURE_P2_MORE_FILE_TYPES,
		getTitle: () => __( 'More file types' ),
		getDescription: () => __( 'Upload videos, audio, .zip and .key files.' ),
	},

	[ FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT ]: {
		getSlug: () => FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT,
		getTitle: () => __( 'Priority customer support' ),
		getDescription: () =>
			__(
				'Live chat is available 24 hours a day from Monday through Friday. You can also email us any day of the week for personalized support.'
			),
	},

	[ FEATURE_P2_ACTIVITY_OVERVIEW ]: {
		getSlug: () => FEATURE_P2_ACTIVITY_OVERVIEW,
		getTitle: () => __( 'Activity overview panel' ),
		getDescription: () => __( 'A complete record of everything that happens on your P2.' ),
	},
	[ FEATURE_SFTP_DATABASE ]: {
		getSlug: () => FEATURE_SFTP_DATABASE,
		getTitle: () => __( 'SFTP, SSH, WP-CLI, and Database access' ),
		getDescription: () =>
			__(
				'A set of developer tools that give you more control over your site, simplify debugging, and make it easier to integrate with each step of your workflow.'
			),
	},

	[ PREMIUM_DESIGN_FOR_STORES ]: {
		getSlug: () => PREMIUM_DESIGN_FOR_STORES,
		getTitle: () => __( 'Premium design options customized for online stores' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS,
		getTitle: () => __( 'Unlimited users' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_EDITOR ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_EDITOR,
		getTitle: () => __( 'Built into WordPress editor' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_UNBRANDED ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_UNBRANDED,
		getTitle: () => __( 'Ad-free and brandable player' ),
	},

	[ FEATURE_JETPACK_VIDEOPRESS_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_VIDEOPRESS_STORAGE,
		getTitle: () => __( '1TB of storage' ),
	},

	/* START - Jetpack tiered product-specific features */
	[ FEATURE_JETPACK_1GB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_1GB_BACKUP_STORAGE,
		getTitle: () => __( 'Starts with 1GB of storage' ),
	},
	[ FEATURE_JETPACK_10GB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_10GB_BACKUP_STORAGE,
		getTitle: () => __( 'Starts with 10GB of storage' ),
	},
	[ FEATURE_JETPACK_1TB_BACKUP_STORAGE ]: {
		getSlug: () => FEATURE_JETPACK_1TB_BACKUP_STORAGE,
		getTitle: () => __( '1TB of backup storage' ),
	},
	[ FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => __( '30-day archive & activity log*' ),
	},
	[ FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG ]: {
		getSlug: () => FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG,
		getTitle: () => __( '1-year archive & activity log*' ),
	},
	[ FEATURE_JETPACK_PRODUCT_BACKUP ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_BACKUP,
		getTitle: () => __( 'All VaultPress Backup features' ),
	},
	[ FEATURE_JETPACK_PRODUCT_VIDEOPRESS ]: {
		getSlug: () => FEATURE_JETPACK_PRODUCT_VIDEOPRESS,
		getTitle: () => __( 'VideoPress' ),
	},
	[ FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES ]: {
		getSlug: () => FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES,
		getTitle: () => __( 'All VaultPress Backup & Security features' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS,
		getTitle: () => __( 'Real-time cloud backups' ),
	},
	[ FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING ]: {
		getSlug: () => FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING,
		getTitle: () => __( 'Real-time malware scanning' ),
	},
	/* END - Jetpack tiered product-specific features */

	/* START - New features Flexible and Pro plans introduced. */
	[ FEATURE_UNLIMITED_USERS ]: {
		getSlug: () => FEATURE_UNLIMITED_USERS,
		getTitle: () => __( 'Unlimited users' ),
	},
	[ FEATURE_UNLIMITED_POSTS_PAGES ]: {
		getSlug: () => FEATURE_UNLIMITED_POSTS_PAGES,
		getTitle: () => __( 'Unlimited blog posts and pages' ),
	},
	[ FEATURE_PAYMENT_BLOCKS ]: {
		getSlug: () => FEATURE_PAYMENT_BLOCKS,
		getTitle: () => __( 'Payment blocks' ),
	},
	[ FEATURE_TITAN_EMAIL ]: {
		getSlug: () => FEATURE_TITAN_EMAIL,
		getTitle: () => __( 'Titan e-mail' ),
	},
	[ FEATURE_UNLIMITED_ADMINS ]: {
		getSlug: () => FEATURE_UNLIMITED_ADMINS,
		getTitle: () => __( 'Unlimited admins' ),
	},
	[ FEATURE_WOOCOMMERCE ]: {
		getSlug: () => FEATURE_WOOCOMMERCE,
		getTitle: () => __( 'WooCommerce' ),
	},
	/* END - New features Flexible and Pro plans introduced. */

	[ FEATURE_UNLIMITED_EMAILS ]: {
		getSlug: () => FEATURE_UNLIMITED_EMAILS,
		getTitle: () => __( 'Send unlimited emails' ),
	},
	[ FEATURE_UNLIMITED_SUBSCRIBERS ]: {
		getSlug: () => FEATURE_UNLIMITED_SUBSCRIBERS,
		getTitle: () => __( 'Import unlimited subscribers' ),
	},
	[ FEATURE_AD_FREE_EXPERIENCE ]: {
		getSlug: () => FEATURE_AD_FREE_EXPERIENCE,
		getTitle: () => __( 'Ad-free browsing experience for your visitors' ),
		getDescription: () => __( 'Unlock a clean, ad-free browsing experience for your visitors.' ),
	},
	[ FEATURE_TRACK_VIEWS_CLICKS ]: {
		getSlug: () => FEATURE_TRACK_VIEWS_CLICKS,
		getTitle: () => __( 'Track your view and click stats' ),
	},
	[ FEATURE_GROUP_PAYMENT_TRANSACTION_FEES ]: {
		getSlug: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
		getTitle: () => __( 'Transaction fees for payments' ),
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_8 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_8,
		getTitle: () => getTransactionFeeCopy( 8 ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_4 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_4,
		getTitle: () => getTransactionFeeCopy( 4 ),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_2 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_2,
		getTitle: () =>
			sprintf(
				/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
				__( '%(commission)d%% transaction fee for payments' ),
				{
					commission: 2,
				}
			),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_PAYMENT_TRANSACTION_FEES_0 ]: {
		getSlug: () => FEATURE_PAYMENT_TRANSACTION_FEES_0,
		getTitle: () =>
			sprintf(
				/* translators: %(commission)d%% is a percentage with a percent sign (e.g: "3%") */
				__( '%(commission)d%% transaction fee for payments' ),
				{
					commission: 0,
				}
			),
		getFeatureGroup: () => FEATURE_GROUP_PAYMENT_TRANSACTION_FEES,
	},
	[ FEATURE_UNLIMITED_TRAFFIC ]: {
		getSlug: () => FEATURE_UNLIMITED_TRAFFIC,
		getTitle: () => __( 'No limitations on site visitors' ),
		getDescription: () => __( 'Grow your site traffic without worrying about limitations.' ),
	},
	[ FEATURE_MANAGED_HOSTING ]: {
		getSlug: () => FEATURE_MANAGED_HOSTING,
		getTitle: () => __( 'Managed hosting' ),
		getDescription: () =>
			__(
				'All plans include world-class managed hosting, including automatic updates, security, backups, and more.'
			),
	},

	[ FEATURE_99_999_UPTIME ]: {
		getSlug: () => FEATURE_99_999_UPTIME,
		getTitle: () => {
			const title = sprintf(
				/* translators: %(uptimePercent)s is a percentage, for example: 99.999% uptime */
				__( '%(uptimePercent)s uptime' ),
				{
					uptimePercent: formatNumber( 0.99999, {
						numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
					} ),
				}
			);
			return hasTranslation( '%(uptimePercent)s uptime' )
				? title
				: // eslint-disable-next-line @wordpress/i18n-translator-comments
				  __( '99.999% uptime' );
		},
		getDescription: () => __( 'Exceptional reliability with industry-leading uptime guarantee.' ),
	},
	[ FEATURE_STYLE_CUSTOMIZATION ]: {
		getSlug: () => FEATURE_STYLE_CUSTOMIZATION,
		getTitle: () => __( 'Customize fonts and colors sitewide' ),
		getDescription: () =>
			__( 'Take control of every font, color, and detail of your site’s design.' ),
	},
	[ FEATURE_WORDADS ]: {
		getSlug: () => FEATURE_WORDADS,
		getTitle: () => __( 'Earn with WordAds' ),
		getDescription: () =>
			__( 'Display ads and earn from premium networks via the WordAds program.' ),
	},
	[ FEATURE_PLUGINS_THEMES ]: {
		getSlug: () => FEATURE_PLUGINS_THEMES,
		getTitle: () => __( 'Install plugins & themes' ),
		getDescription: () =>
			__( 'Unlock access to 50,000+ plugins, design templates, and integrations.' ),
	},
	[ FEATURE_STATS_PAID ]: {
		getSlug: () => FEATURE_STATS_PAID,
		getTitle: () => {
			return isEnabled( 'stats/paid-wpcom-v3' )
				? __( 'Detailed traffic stats beyond the last 7 days and site insights' )
				: __( 'In-depth site analytics dashboard' );
		},
		getDescription: () =>
			__( 'Deep-dive analytics and conversion data to help you make decisions to grow your site.' ),
	},
	[ FEATURE_STATS_COMMERCIAL ]: {
		getSlug: () => FEATURE_STATS_COMMERCIAL,
		getTitle: () => __( 'In-depth site analytics dashboard' ),
		getDescription: () =>
			__( 'Deep-dive analytics and conversion data to help you make decisions to grow your site.' ),
	},
	[ FEATURE_WAF_V2 ]: {
		getSlug: () => FEATURE_WAF_V2,
		getTitle: () => __( 'Web application firewall (WAF)' ),
		getDescription: () => __( 'Block out malicious activity like SQL injection and XSS attacks.' ),
	},
	[ FEATURE_CDN ]: {
		getSlug: () => FEATURE_CDN,
		getTitle: () => __( 'Global CDN with 28+ locations' ),
		getDescription: () => __( 'Rely on ultra-fast site speeds, just about anywhere on earth.' ),
	},
	[ FEATURE_REAL_TIME_SECURITY_SCANS ]: {
		getSlug: () => FEATURE_REAL_TIME_SECURITY_SCANS,
		getTitle: () => __( 'Real-time security scans' ),
		getDescription: () =>
			__(
				"Our dedicated security team works round-the-clock to identify and combat vulnerabilities so that you don't have to."
			),
	},
	[ FEATURE_SECURITY_DDOS ]: {
		getSlug: () => FEATURE_SECURITY_DDOS,
		getTitle: () => __( 'DDoS protection and mitigation' ),
		getDescription: () =>
			__( 'Breeze past DDoS attacks thanks to real-time monitoring and mitigation.' ),
	},
	[ FEATURE_DEV_TOOLS ]: {
		getSlug: () => FEATURE_DEV_TOOLS,
		getTitle: () => __( 'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments' ),
		getDescription: () => __( 'Use familiar developer tools to manage and deploy your site.' ),
	},
	[ FEATURE_DEV_TOOLS_SSH ]: {
		getSlug: () => FEATURE_DEV_TOOLS_SSH,
		getTitle: () => __( 'SFTP/SSH, WP-CLI' ),
		getDescription: () => __( 'Access your site via SSH and manage it with WP-CLI.' ),
	},
	[ FEATURE_DEV_TOOLS_GIT ]: {
		getSlug: () => FEATURE_DEV_TOOLS_GIT,
		getTitle: () => __( 'Git commands and GitHub Deployments' ),
		getDescription: () =>
			__( 'Deploy from GitHub with a few clicks. Simple and advanced deployment modes supported.' ),
	},
	[ FEATURE_SITE_STAGING_SITES ]: {
		getSlug: () => FEATURE_SITE_STAGING_SITES,
		getTitle: () => __( 'Free staging site' ),
		getDescription: () => __( 'Test product and design changes in a staging site.' ),
	},

	[ FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING ]: {
		getSlug: () => FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING,
		getTitle: () => __( 'Seamless syncing between staging and production' ),
		getDescription: () =>
			__(
				'Iterate faster and deploy confidently by synchronizing staging and production environments in a few short steps.'
			),
	},
	[ FEATURE_SELL_SHIP ]: {
		getSlug: () => FEATURE_SELL_SHIP,
		getTitle: () => __( 'Sell and ship products' ),
		getDescription: () => __( 'Sell and ship out physical goods from your site.' ),
	},
	[ FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN ]: {
		getSlug: () => FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN,
		getTitle: () => __( 'Automated backup + quick restore' ),
	},
	[ FEATURE_INTEGRATED_SHIPMENT_TRACKING ]: {
		getSlug: () => FEATURE_INTEGRATED_SHIPMENT_TRACKING,
		getTitle: () => __( 'Shipment tracking' ),
	},
	[ FEATURE_BACK_IN_STOCK_NOTIFICATIONS ]: {
		getSlug: () => FEATURE_BACK_IN_STOCK_NOTIFICATIONS,
		getTitle: () => __( 'Back in stock emails' ),
		getDescription: () => __( 'Notify customers when an out-of-stock item is back in stock.' ),
	},
	[ FEATURE_MARKETING_AUTOMATION ]: {
		getSlug: () => FEATURE_MARKETING_AUTOMATION,
		getTitle: () => __( 'Marketing automation' ),
		getDescription: () =>
			__( 'Automate marketing campaigns to send targeted and personalized messages to customers.' ),
	},
	[ FEATURE_MIN_MAX_ORDER_QUANTITY ]: {
		getSlug: () => FEATURE_MIN_MAX_ORDER_QUANTITY,
		getTitle: () => __( 'Min/Max Quantities' ),
		getDescription: () =>
			__( 'Specify the minimum and maximum allowed product quantities for orders.' ),
	},
	[ FEATURE_ACCEPT_PAYMENTS_V2 ]: {
		getSlug: () => FEATURE_ACCEPT_PAYMENTS_V2,
		getTitle: () => __( 'Payments in 60+ countries' ),
		getDescription: () => __( 'Accept payments for goods and services, just about anywhere.' ),
	},
	[ FEATURE_SALES_REPORTS ]: {
		getSlug: () => FEATURE_SALES_REPORTS,
		getTitle: () => __( 'Sales reports' ),
		getDescription: () =>
			__( 'Stay up to date on sales and identify trends with intuitive sales reports.' ),
	},
	[ FEATURE_PRODUCT_ADD_ONS ]: {
		getSlug: () => FEATURE_PRODUCT_ADD_ONS,
		getTitle: () => __( 'Product Add-Ons' ),
		getDescription: () =>
			__(
				'Offer extra products and services, such as gift wrapping, a special message, extended warranty, insurance, customizations, and more.'
			),
	},
	[ FEATURE_FAST_SUPPORT_FROM_EXPERTS ]: {
		getSlug: () => FEATURE_FAST_SUPPORT_FROM_EXPERTS,
		getTitle: () => __( 'Fast support from our expert\u00A0team' ),
		getDescription: () => __( 'Prompt support from our expert, friendly Happiness team' ),
	},
	[ FEATURE_PRIORITY_24_7_SUPPORT ]: {
		getSlug: () => FEATURE_PRIORITY_24_7_SUPPORT,
		getTitle: () => __( 'Priority 24/7 support from our expert\u00A0team' ),
		getDescription: () => __( 'The fastest 24/7 support from our expert, friendly Happiness team' ),
	},

	/* START: Woo Express Features */
	[ FEATURE_WOOCOMMERCE_STORE ]: {
		getSlug: () => FEATURE_WOOCOMMERCE_STORE,
		getTitle: () => __( 'WooCommerce store' ),
		getDescription: () => '',
	},
	[ FEATURE_WOOCOMMERCE_MOBILE_APP ]: {
		getSlug: () => FEATURE_WOOCOMMERCE_MOBILE_APP,
		getTitle: () => __( 'WooCommerce mobile app' ),
		getDescription: () => '',
	},
	[ FEATURE_WORDPRESS_CMS ]: {
		getSlug: () => FEATURE_WORDPRESS_CMS,
		getTitle: () => __( 'WordPress CMS' ),
		getDescription: () => '',
	},
	[ FEATURE_WORDPRESS_MOBILE_APP ]: {
		getSlug: () => FEATURE_WORDPRESS_MOBILE_APP,
		getTitle: () => __( 'WordPress mobile app' ),
		getDescription: () => '',
	},
	[ FEATURE_FREE_SSL_CERTIFICATE ]: {
		getSlug: () => FEATURE_FREE_SSL_CERTIFICATE,
		getTitle: () => __( 'Free SSL certificate' ),
		getDescription: () => '',
	},
	[ FEATURE_GOOGLE_ANALYTICS_V3 ]: {
		getSlug: () => FEATURE_GOOGLE_ANALYTICS_V3,
		getTitle: () => __( 'Google Analytics' ),
		getDescription: () => '',
	},
	[ FEATURE_LIST_UNLIMITED_PRODUCTS ]: {
		getSlug: () => FEATURE_LIST_UNLIMITED_PRODUCTS,
		getTitle: () => __( 'List unlimited products' ),
		getDescription: () => '',
	},
	[ FEATURE_GIFT_CARDS ]: {
		getSlug: () => FEATURE_GIFT_CARDS,
		getTitle: () => __( 'Gift Cards' ),
		getDescription: () => __( 'Offer multi-purpose gift cards that customers can redeem online.' ),
	},
	[ FEATURE_PRODUCT_BUNDLES ]: {
		getSlug: () => FEATURE_PRODUCT_BUNDLES,
		getTitle: () => __( 'Product Bundles' ),
		getDescription: () =>
			__(
				'Combine products in bundles. Offer discount packages and create product kits and curated lists of products that are bought together often.'
			),
	},
	[ FEATURE_LIST_PRODUCTS_BY_BRAND ]: {
		getSlug: () => FEATURE_LIST_PRODUCTS_BY_BRAND,
		getTitle: () => __( 'List products by brand' ),
		getDescription: () => '',
	},
	[ FEATURE_PRODUCT_RECOMMENDATIONS ]: {
		getSlug: () => FEATURE_PRODUCT_RECOMMENDATIONS,
		getTitle: () => __( 'Product Recommendations' ),
		getDescription: () =>
			__(
				'Offer smart upsells, cross-sells, and “frequently bought together” recommendations and measure their impact with in-depth analytics.'
			),
	},
	[ FEATURE_INTEGRATED_PAYMENTS ]: {
		getSlug: () => FEATURE_INTEGRATED_PAYMENTS,
		getTitle: () => __( 'Integrated payments' ),
		getDescription: () => '',
	},
	[ FEATURE_INTERNATIONAL_PAYMENTS ]: {
		getSlug: () => FEATURE_INTERNATIONAL_PAYMENTS,
		getTitle: () => __( 'International payments' ),
		getDescription: () => '',
	},
	[ FEATURE_AUTOMATED_SALES_TAXES ]: {
		getSlug: () => FEATURE_AUTOMATED_SALES_TAXES,
		getTitle: () => __( 'Automated sales taxes' ),
		getDescription: () => '',
	},
	[ FEATURE_ACCEPT_LOCAL_PAYMENTS ]: {
		getSlug: () => FEATURE_ACCEPT_LOCAL_PAYMENTS,
		getTitle: () => __( 'Accept local payments' ),
		getDescription: () => '',
	},
	[ FEATURE_RECURRING_PAYMENTS ]: {
		getSlug: () => FEATURE_RECURRING_PAYMENTS,
		getTitle: () => __( 'Recurring payments' ),
		getDescription: () => '',
	},
	[ FEATURE_PROMOTE_ON_TIKTOK ]: {
		getSlug: () => FEATURE_PROMOTE_ON_TIKTOK,
		getTitle: () => __( 'Promote on TikTok' ),
		getDescription: () => '',
	},
	[ FEATURE_SYNC_WITH_PINTEREST ]: {
		getSlug: () => FEATURE_SYNC_WITH_PINTEREST,
		getTitle: () => __( 'Sync with Pinterest' ),
		getDescription: () => '',
	},
	[ FEATURE_CONNECT_WITH_FACEBOOK ]: {
		getSlug: () => FEATURE_CONNECT_WITH_FACEBOOK,
		getTitle: () => __( 'Connect with Facebook' ),
		getDescription: () => '',
	},
	[ FEATURE_ABANDONED_CART_RECOVERY ]: {
		getSlug: () => FEATURE_ABANDONED_CART_RECOVERY,
		getTitle: () => __( 'Abandoned cart recovery' ),
		getDescription: () => '',
	},
	[ FEATURE_ADVERTISE_ON_GOOGLE ]: {
		getSlug: () => FEATURE_ADVERTISE_ON_GOOGLE,
		getTitle: () => __( 'Advertise on Google' ),
		getDescription: () => '',
	},
	[ FEATURE_CUSTOM_ORDER_EMAILS ]: {
		getSlug: () => FEATURE_CUSTOM_ORDER_EMAILS,
		getTitle: () => __( 'Custom order emails' ),
		getDescription: () => '',
	},
	[ FEATURE_LIVE_SHIPPING_RATES ]: {
		getSlug: () => FEATURE_LIVE_SHIPPING_RATES,
		getTitle: () => __( 'Live shipping rates' ),
		getDescription: () => '',
	},
	[ FEATURE_DISCOUNTED_SHIPPING ]: {
		getSlug: () => FEATURE_DISCOUNTED_SHIPPING,
		getTitle: () => __( 'Discounted shipping' ),
		getDescription: () => '',
	},
	[ FEATURE_PRINT_SHIPPING_LABELS ]: {
		getSlug: () => FEATURE_PRINT_SHIPPING_LABELS,
		getTitle: () => __( 'Print shipping labels' ),
		getDescription: () => '',
	},
	[ FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION ]: {
		getSlug: () => FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION,
		getTitle: () => __( 'AI-assisted product descriptions' ),
		getDescription: () => '',
	},
	/* END: Woo Express Features */

	[ FEATURE_WOO_SHIPPING_TRACKING ]: {
		getSlug: () => FEATURE_WOO_SHIPPING_TRACKING,
		getTitle: () => __( 'Shipping & tracking' ),
		getDescription: () => __( 'Integrations with top shipping carriers.' ),
	},
	[ FEATURE_WOO_AUTOMATE ]: {
		getSlug: () => FEATURE_WOO_AUTOMATE,
		getTitle: () => __( 'AutomateWoo' ),
		getDescription: () =>
			__(
				'Create a near-endless range of automated workflows to help you grow your store, including different combinations of triggers, rules, and actions.'
			),
	},
	[ FEATURE_GOOGLE_LISTING_ADS ]: {
		getSlug: () => FEATURE_GOOGLE_LISTING_ADS,
		getTitle: () => __( 'Google Listings & Ads' ),
		getDescription: () =>
			__( 'Create free listings and ads to showcase your products to shoppers across Google.' ),
	},
};

//used
export function getFeatureByKey( feature: string ) {
	return FEATURES_LIST[ feature ];
}

type DynamicFeatureProps = {
	domainName: string;
	themeName: string;
	pluginCount: number;
	monthlyVisitorCount: number;
};
type DynamicFeatureList = ( props: DynamicFeatureProps ) => FeatureObject[];
type JetpackDynamicFeatureProps = {
	siteSlug: string | undefined;
	hasPremiumSupport: boolean | false;
	hasSimplePayments: boolean | false;
	hasWordAdsInstant: boolean | false;
	hasBackups: boolean | false;
	backupsIsStandalone: boolean | false;
	backups: BackupEntry[] | undefined;
	hasSearch: boolean | false;
	hasBoost: boolean | false;
	hasAntiSpam: boolean | false;
	hasScan: boolean | false;
	siteScanState: SiteScan | undefined;
	siteThreatCounts: SiteScanCounts | undefined;
	requestingSiteThreatCounts: boolean | false;
	siteScanIsStandalone: boolean | false;
	hasYearActivityLog: boolean | false;
	hasMonthActivityLog: boolean | false;
	hasVideoPress: boolean | false;
	hasVideoUploadsJetpackPro: boolean | false;
	siteMediaCount: number | 0;
};
type JetpackDynamicFeatureList = ( props: JetpackDynamicFeatureProps ) => FeatureObject[];
type GSuiteDynamicFeatureProps = {
	domainName: string;
	productSlug: string;
};
type GSuiteDynamicFeatureList = ( props: GSuiteDynamicFeatureProps ) => FeatureObject[];

export const getGSuiteDynamicFeaturesList: GSuiteDynamicFeatureList = ( {
	domainName,
	productSlug,
}: GSuiteDynamicFeatureProps ) => {
	const features = [];
	const getStorageText = () => {
		if ( GoogleWorkspaceSlugs.GSUITE_BUSINESS_SLUG === productSlug ) {
			return __( 'Get unlimited storage for all your files synced across devices.' );
		}

		return __( 'Get 30GB of storage for all your files synced across devices.' );
	};

	const getStorageTitle = () => {
		if ( GoogleWorkspaceSlugs.GSUITE_BUSINESS_SLUG === productSlug ) {
			return __( 'Unlimited cloud storage (or 1TB per user if fewer than 5 users)' );
		}

		return __( '30GB of cloud storage' );
	};

	features.push( {
		getSlug: () => 'customDomainEmailAddress',
		getTitle: () =>
			sprintf(
				/* translators: @%(domain)s is the part of the domain name including and after the `@`, for example: '@wordpress.com' */
				__( 'A custom @%(domain)s email address' ),
				{
					domain: domainName,
				}
			),
		getDescription: () => __( 'Professional ad-free email that works with most email clients.' ),
	} );

	features.push( {
		getSlug: () => 'docsSpreadsheetsAndMore',
		getTitle: () => __( 'Docs, spreadsheets and more' ),
		getDescription: () => __( 'Collaborate in real-time with documents, spreadsheets and slides.' ),
	} );

	features.push( {
		getSlug: () => 'gSuiteStorageFeatures',
		getTitle: () => getStorageTitle(),
		getDescription: () => getStorageText(),
	} );

	features.push( {
		getSlug: () => 'videoCallsAndTextChanges',
		getTitle: () => __( 'Connect with your team' ),
		getDescription: () => __( 'Use text chats or video calls, with built in screen sharing.' ),
	} );
	return features;
};

export const getJetpackDynamicFeaturesList: JetpackDynamicFeatureList = ( {
	siteSlug,
	hasPremiumSupport,
	hasSimplePayments,
	hasWordAdsInstant,
	hasBackups,
	backupsIsStandalone,
	backups,
	hasSearch,
	hasBoost,
	hasAntiSpam,
	hasScan,
	siteScanState,
	siteThreatCounts,
	requestingSiteThreatCounts,
	siteScanIsStandalone,
	hasYearActivityLog,
	hasMonthActivityLog,
	hasVideoPress,
	hasVideoUploadsJetpackPro,
	siteMediaCount,
}: JetpackDynamicFeatureProps ) => {
	const features = [];

	const backupCurrentlyInProgress = backups?.find?.( ( b ) => b.status === 'started' );

	// now that backups are loaded and any in progress are complete, get the most recent one
	const mostRecentBackup = backups?.[ 0 ] || null;

	if ( hasPremiumSupport ) {
		// Priority Support
		features.push( {
			getSlug: () => 'premiumSupport',
			getTitle: () =>
				createInterpolateElement(
					__( "<strong>Priority support</strong> from Jetpack's WordPress and security experts." ),
					{
						strong: <strong />,
					}
				),
		} );
	}

	if ( hasSimplePayments ) {
		// Payment Collection
		features.push( {
			getSlug: () => 'simplePayments',
			getTitle: () =>
				createInterpolateElement( __( 'The ability to <strong>collect payments</strong>.' ), {
					strong: <strong />,
				} ),
		} );
	}

	if ( hasWordAdsInstant ) {
		// Ad Program
		features.push( {
			getSlug: () => 'wordAdsInstant',
			getTitle: () =>
				createInterpolateElement( __( 'The <strong>Ad program</strong> for WordPress.' ), {
					strong: <strong />,
				} ),
		} );
	}

	if ( hasBackups ) {
		if ( siteSlug ) {
			if ( backupCurrentlyInProgress ) {
				features.push( {
					getSlug: () => 'siteBackups',
					getTitle: () => __( 'Site Backups' ),
					getDescription: () => (
						<>
							{ __( 'In Progress' ) }
							<ProgressBar
								value={ parseInt( backupCurrentlyInProgress.percent ) }
								max={ 100 }
								color="#069E08"
							/>
						</>
					),
				} );
			} else if ( mostRecentBackup ) {
				if ( mostRecentBackup.status !== 'finished' && mostRecentBackup.status !== 'started' ) {
					features.push( {
						getSlug: () => 'siteBackups',
						getTitle: () => __( 'Site Backups' ),
						getDescription: () =>
							__(
								"Jetpack's last attempt to back up your site was not successful. Please contact Jetpack support."
							),
					} );
				} else {
					const lastBackupTimeAgo = formatRelative(
						new Date( mostRecentBackup.last_updated ),
						new Date()
					);
					if ( backupsIsStandalone ) {
						features.push( {
							getSlug: () => 'siteBackups',
							getTitle: () => __( 'Site Backups' ),
							getDescription: () =>
								sprintf(
									/* translators: %(lastBackupTimeAgo)s is a translated version of the time passed since last backup (e.g., "1 day, 2 hours, 3 minutes"), %(posts)d, %(uploads)d and %(plugins)d are all numbers */
									__(
										'Your latest site backup: %(lastBackupTimeAgo)s (%(posts)d posts, %(uploads)d uploads, %(plugins)d plugins)'
									),
									{
										lastBackupTimeAgo,
										posts: 0, //TODO: fix
										// mostRecentBackup.stats?.tables?.[ mostRecentBackup.stats?.prefix + 'posts' ]
										// 	.post_published ??
										// mostRecentBackup.stats?.tables?.[ mostRecentBackup.stats?.prefix + 'posts' ]
										// 	?.published ?? 0,
										uploads: 0, //mostRecentBackup.stats?.[ 'uploads' ]?.count ?? 0, //TODO: fix
										plugins: 0, //mostRecentBackup.stats?.[ 'plugins' ]?.count ?? 0, //TODO: fix
									}
								),
						} );
					} else {
						features.push( {
							getSlug: () => 'siteBackups',
							getTitle: () => __( 'Site Backups' ),
							getDescription: () =>
								/* translators: %(lastBackupTimeAgo)s is a translated version of the time passed since last backup (e.g., "1 day, 2 hours, 3 minutes") */
								sprintf( __( 'Your latest site backup: %(lastBackupTimeAgo)s' ), {
									lastBackupTimeAgo,
								} ),
						} );
					}
				}
			} else {
				features.push( {
					getSlug: () => 'siteBackups',
					getTitle: () => __( 'Site Backups' ),
					getDescription: () => __( 'Jetpack will back up your site soon.' ),
				} );
			}
		} else {
			features.push( {
				getSlug: () => 'siteBackups',
				getTitle: () => __( 'Site Backups' ),
				getDescription: () => __( 'License key awaiting activation' ),
			} );
		}
	}
	if ( hasSearch ) {
		features.push( {
			getSlug: () => 'siteSearch',
			getTitle: () => __( 'Search' ),
			getDescription: () =>
				__(
					'Jetpack Search helps your visitors instantly find the right content – right when they need it.'
				),
		} );
	}
	if ( hasBoost ) {
		features.push( {
			getSlug: () => 'siteBoost',
			getTitle: () => __( 'Boost' ),
			getDescription: () =>
				__(
					'Jetpack Boost improves your site performance and automatically generates critical CSS.'
				),
		} );
	}
	if ( hasAntiSpam ) {
		features.push( {
			getSlug: () => 'siteAntiSpam',
			getTitle: () => __( 'Akismet Anti-spam' ),
			getDescription: () =>
				__( 'Jetpack Akismet Anti-spam automatcally clears spam from comments and forms.' ),
		} );
	}
	if ( hasScan ) {
		const siteScanProgress =
			siteScanState?.state === 'scanning' ? siteScanState?.current?.progress ?? 0 : 0;
		const { threats, most_recent: mostRecent } = siteScanState ?? {
			threats: 0,
			most_recent: undefined,
		};
		const mostRecentScanAgo = mostRecent
			? formatRelative( new Date( mostRecent.timestamp ), new Date() )
			: '';

		// site scan state can be provisioning, scanning or idle. If missing from the state after request is ended, can assume an error
		const scanState = siteScanState?.state;
		const threatsFixedCount = siteThreatCounts ? siteThreatCounts.fixed : 0;

		if ( scanState ) {
			switch ( scanState ) {
				case 'scanning': // scan is running now
					features.push( {
						getSlug: () => 'siteScan',
						getTitle: () => __( 'Site Scan' ),
						getDescription: () => (
							<>
								{ __( 'In Progress' ) }:
								<ProgressBar value={ siteScanProgress ?? 0 } max={ 100 } color="#069E08" />
							</>
						),
					} );
					break;
				case 'provisioning': // scan getting ready to start
					features.push( {
						getSlug: () => 'siteScan',
						getTitle: () => __( 'Site Scan' ),
						getDescription: () => __( 'Jetpack is preparing to scan your site.' ),
					} );
					break;
				default: // still requesting scan state
					// there is no most recent scan - for some reason, scan has not run yet
					if ( ! mostRecent ) {
						features.push( {
							getSlug: () => 'siteScan',
							getTitle: () => __( 'Site Scan' ),
							getDescription: () => __( 'Jetpack will scan your site for threats soon.' ),
						} );
						// show expended output for standalone scan products
					} else if ( siteScanIsStandalone && mostRecent ) {
						features.push( {
							getSlug: () => 'siteScan',
							getTitle: () => __( 'Site Scan' ),
							getDescription: () => (
								<>
									{ __( 'Last Scan' ) }
									{ mostRecentScanAgo }:
									{ sprintf(
										/* translators: %(threatCount)s is a number */
										__( '%(threatCount)s Malware Threats Found' ),
										{
											threatCount: threats ? threats.length : '...',
										}
									) }
									,
									{ sprintf(
										/* translators: %(threatsFixedCount)s is a number */
										__( '%(threatsFixedCount)s Threats Fixed (Lifetime)' ),
										{
											threatsFixedCount: requestingSiteThreatCounts ? '...' : threatsFixedCount,
										}
									) }
								</>
							),
						} );
					} else {
						features.push( {
							getSlug: () => 'siteScan',
							getTitle: () => __( 'Site Scan' ),
							getDescription: () => __( 'Waiting for scan status' ),
						} );
					}
					break;
			}
		} else {
			// something went wrong getting the scan state
			features.push( {
				getSlug: () => 'siteScan',
				getTitle: () => __( 'Site Scan' ),
				getDescription: () => __( 'Jetpack is having trouble scanning your site.' ),
			} );
		}
	}

	if ( hasYearActivityLog ) {
		features.push( {
			getSlug: () => 'siteYearActivityLog',
			getTitle: () => __( 'Activity Log' ),
			getDescription: () =>
				__( 'Your 1-year Activity Log archive will revert to the 20 most recent events.' ),
		} );
	}
	if ( hasMonthActivityLog ) {
		features.push( {
			getSlug: () => 'siteMonthActivityLog',
			getTitle: () => __( 'Activity Log' ),
			getDescription: () =>
				__( 'Your 30-day Activity Log archive will revert to the 20 most recent events.' ),
		} );
	}
	if ( hasVideoPress ) {
		features.push( {
			getSlug: () => 'videoPress',
			getTitle: () => __( 'Video Hosting' ),
			getDescription: () =>
				sprintf(
					/* translators: %(siteMediaCount)d is a number */
					__( 'Videos hosted with VideoPress: %(siteMediaCount)d' ),
					{ siteMediaCount }
				),
		} );
		if ( hasVideoUploadsJetpackPro ) {
			features.push( {
				getSlug: () => 'videoPressGeneral',
				getTitle: () =>
					createInterpolateElement(
						__( 'Up to 13TB of <strong>high-speed video hosting</strong>.' ),
						{
							strong: <strong />,
						}
					),
			} );
		} else {
			features.push( {
				getSlug: () => 'videoPressGeneral',
				getTitle: () =>
					createInterpolateElement(
						__( 'Up to 1TB of <strong>high-speed video hosting</strong>.' ),
						{
							strong: <strong />,
						}
					),
			} );
		}
	}

	// General benefits of all Jetpack Plans (brute force protection, CDN)
	features.push( {
		getSlug: () => 'generalBruteForceAndDowntimeMonitoring',
		getTitle: () =>
			createInterpolateElement(
				__(
					'Brute force <strong>attack protection</strong> and <strong>downtime monitoring</strong>.'
				),
				{
					strong: <strong />,
				}
			),
	} );

	return features;
};

export const getDynamicFeaturesList: DynamicFeatureList = ( {
	domainName,
	themeName,
	pluginCount,
	monthlyVisitorCount,
}: DynamicFeatureProps ) => {
	const features = [];
	if ( domainName ) {
		features.push( {
			getSlug: () => 'primaryDomain',
			getTitle: () =>
				/* translators: %(domainName)s is a domain name */
				sprintf( __( '%(domainName)s as your primary domain.' ), { domainName: domainName } ),
		} );
	}
	if ( themeName && pluginCount > 0 ) {
		features.push( {
			getSlug: () => '',
			getTitle: () =>
				/* translators: %(themeName)s is the name of the theme, %(pluginCount)d is a number representing the number of plugins currently installed on the site */
				sprintf( __( '%(themeName)s theme with %(pluginCount)d plugins enabled.' ), {
					themeName,
					pluginCount,
				} ),
		} );
	}
	if ( monthlyVisitorCount > 0 ) {
		features.push( {
			getSlug: () => '',
			getTitle: () =>
				/* translators: %(monthlyVisitorCount)d is a number representing the number of visitors in a month */
				sprintf( __( 'Fast loading for your %(monthlyVisitorCount)s visitors.' ), {
					monthlyVisitorCount,
				} ),
		} );
	}
	features.push( {
		getSlug: () => '',
		getTitle: () => __( 'Custom theme colors and fonts.' ),
	} );
	return features;
};
