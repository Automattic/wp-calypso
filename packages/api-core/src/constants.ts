import { __ } from '@wordpress/i18n';
import { DataCenterOption } from './site-hosting/types';

export const DotcomPlans = {
	BUSINESS: 'business-bundle',
	BUSINESS_MONTHLY: 'business-bundle-monthly',
	BUSINESS_2_YEARS: 'business-bundle-2y',
	BUSINESS_3_YEARS: 'business-bundle-3y',
	ECOMMERCE: 'ecommerce-bundle',
	ECOMMERCE_2_YEARS: 'ecommerce-bundle-2y',
	ECOMMERCE_3_YEARS: 'ecommerce-bundle-3y',
	ECOMMERCE_MONTHLY: 'ecommerce-bundle-monthly',
	ECOMMERCE_TRIAL_MONTHLY: 'ecommerce-trial-bundle-monthly',
	FREE_PLAN: 'free_plan',
	HOSTING_TRIAL_MONTHLY: 'wp_bundle_hosting_trial_monthly',
	JETPACK_FREE: 'jetpack_free',
	MIGRATION_TRIAL_MONTHLY: 'wp_bundle_migration_trial_monthly',
	PREMIUM: 'value_bundle',
	PREMIUM_MONTHLY: 'value_bundle_monthly',
	PREMIUM_2_YEARS: 'value_bundle-2y',
	PREMIUM_3_YEARS: 'value_bundle-3y',
} as const;

export const BusinessPlans = [
	DotcomPlans.BUSINESS_MONTHLY,
	DotcomPlans.BUSINESS,
	DotcomPlans.BUSINESS_2_YEARS,
	DotcomPlans.BUSINESS_3_YEARS,
];

export const EcommercePlans = [
	DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
	DotcomPlans.ECOMMERCE_MONTHLY,
	DotcomPlans.ECOMMERCE,
	DotcomPlans.ECOMMERCE_2_YEARS,
	DotcomPlans.ECOMMERCE_3_YEARS,
];

export type DotcomPlanSlug = ( typeof DotcomPlans )[ keyof typeof DotcomPlans ];

export const DotcomFeatures = {
	ATOMIC: 'atomic',
	BACKUPS: 'backups',
	SUBSCRIPTION_GIFTING: 'subscription-gifting',
	COPY_SITE: 'copy-site',
	FULL_ACTIVITY_LOG: 'full-activity-log',
	GITHUB_DEPLOYMENTS: 'github-deployments',
	LEGACY_CONTACT: 'legacy-contact',
	LOCKED_MODE: 'locked-mode',
	LOGS: 'logs',
	MONITORING: 'monitoring',
	PERFORMANCE: 'performance',
	SCAN: 'scan',
	SECURITY_SETTINGS: 'security-settings',
	SET_PRIMARY_CUSTOM_DOMAIN: 'set-primary-custom-domain',
	SFTP: 'sftp',
	SSH: 'ssh',
	SITE_PREVIEW_LINKS: 'site-preview-links',
	STAGING_SITES: 'staging-sites',
} as const;

export type DotcomFeatureSlug = ( typeof DotcomFeatures )[ keyof typeof DotcomFeatures ];

// Features that are used to identify the paid product.
// Feature slug extracted from https://github.com/Automattic/jetpack/tree/trunk/projects/packages/my-jetpack/src/products.
export const JetpackFeatures = {
	ANTISPAM: 'antispam',
	BACKUPS: 'backups',
	CLOUD_CRITICAL_CSS: 'cloud-critical-css',
	MONITOR: 'monitor',
	SCAN: 'scan',
	SOCIAL_ENHANCED_PUBLISHING: 'social-enhanced-publishing',
	STATS: 'stats-paid',
	SEARCH: 'search',
	VIDEOPRESS: 'videopress',
} as const;

export type JetpackFeatureSlug = ( typeof JetpackFeatures )[ keyof typeof JetpackFeatures ];

export const JetpackModules = {
	MONITOR: 'monitor',
	PROTECT: 'protect',
	SSO: 'sso',
	STATS: 'stats',
	WAF: 'waf',
} as const;

export type JetpackModuleSlug = ( typeof JetpackModules )[ keyof typeof JetpackModules ];

// Features that needs Atomic or self-hosted infrastructure,
// mapped to the required WordPress.com plan feature.
export const HostingFeatures = {
	BACKUPS: DotcomFeatures.BACKUPS,
	CACHING: DotcomFeatures.ATOMIC,
	DATABASE: DotcomFeatures.SFTP,
	DEFENSIVE_MODE: DotcomFeatures.SFTP,
	DEPLOYMENT: DotcomFeatures.GITHUB_DEPLOYMENTS,
	LOGS: DotcomFeatures.LOGS,
	ACTIVITY_LOG: DotcomFeatures.FULL_ACTIVITY_LOG,
	MONITOR: DotcomFeatures.MONITORING,
	PERFORMANCE: DotcomFeatures.PERFORMANCE,
	PHP: DotcomFeatures.SFTP,
	PRIMARY_DATA_CENTER: DotcomFeatures.SFTP,
	SCAN: DotcomFeatures.SCAN,
	SECURITY_SETTINGS: DotcomFeatures.SECURITY_SETTINGS,
	SFTP: DotcomFeatures.SFTP,
	SSH: DotcomFeatures.SSH,
	STAGING_SITE: DotcomFeatures.STAGING_SITES,
	STATIC_FILE_404: DotcomFeatures.SFTP,
} as const;

export type HostingFeatureSlug = ( typeof HostingFeatures )[ keyof typeof HostingFeatures ];

export const SubscriptionBillPeriod = {
	PLAN_ONE_TIME_PERIOD: -1,
	PLAN_MONTHLY_PERIOD: 31,
	PLAN_ANNUAL_PERIOD: 365,
	PLAN_BIENNIAL_PERIOD: 730,
	PLAN_TRIENNIAL_PERIOD: 1095,
	PLAN_QUADRENNIAL_PERIOD: 1460,
	PLAN_QUINQUENNIAL_PERIOD: 1825,
	PLAN_SEXENNIAL_PERIOD: 2190,
	PLAN_SEPTENNIAL_PERIOD: 2555,
	PLAN_OCTENNIAL_PERIOD: 2920,
	PLAN_NOVENNIAL_PERIOD: 3285,
	PLAN_DECENNIAL_PERIOD: 3650,
	PLAN_CENTENNIAL_PERIOD: 36500,
} as const;

export const AkismetPlans = {
	PRODUCT_AKISMET_FREE: 'ak_free_yearly',
	PRODUCT_AKISMET_PERSONAL_MONTHLY: 'ak_personal_monthly',
	PRODUCT_AKISMET_PERSONAL_YEARLY: 'ak_personal_yearly',
	PRODUCT_AKISMET_PLUS_BI_YEARLY: 'ak_plus_bi_yearly_1',
	PRODUCT_AKISMET_PLUS_YEARLY: 'ak_plus_yearly_1',
	PRODUCT_AKISMET_PLUS_MONTHLY: 'ak_plus_monthly_1',
	PRODUCT_AKISMET_PLUS_20K_BI_YEARLY: 'ak_plus_bi_yearly_2',
	PRODUCT_AKISMET_PLUS_20K_YEARLY: 'ak_plus_yearly_2',
	PRODUCT_AKISMET_PLUS_20K_MONTHLY: 'ak_plus_monthly_2',
	PRODUCT_AKISMET_PLUS_30K_BI_YEARLY: 'ak_plus_bi_yearly_3',
	PRODUCT_AKISMET_PLUS_30K_YEARLY: 'ak_plus_yearly_3',
	PRODUCT_AKISMET_PLUS_30K_MONTHLY: 'ak_plus_monthly_3',
	PRODUCT_AKISMET_PLUS_40K_BI_YEARLY: 'ak_plus_bi_yearly_4',
	PRODUCT_AKISMET_PLUS_40K_YEARLY: 'ak_plus_yearly_4',
	PRODUCT_AKISMET_PLUS_40K_MONTHLY: 'ak_plus_monthly_4',
	PRODUCT_AKISMET_ENTERPRISE_BI_YEARLY: 'ak_ent_bi_yearly_1',
	PRODUCT_AKISMET_ENTERPRISE_YEARLY: 'ak_ent_yearly_1',
	PRODUCT_AKISMET_ENTERPRISE_MONTHLY: 'ak_ent_monthly_1',
	PRODUCT_AKISMET_ENTERPRISE_350K_YEARLY: 'ak_ep350k_yearly_1',
	PRODUCT_AKISMET_ENTERPRISE_350K_MONTHLY: 'ak_ep350k_monthly_1',
	PRODUCT_AKISMET_ENTERPRISE_2M_YEARLY: 'ak_ep2m_yearly_1',
	PRODUCT_AKISMET_ENTERPRISE_2M_MONTHLY: 'ak_ep2m_monthly_1',
	PRODUCT_AKISMET_ENTERPRISE_GT2M_YEARLY: 'ak_epgt2m_yearly_1',
	PRODUCT_AKISMET_ENTERPRISE_GT2M_MONTHLY: 'ak_epgt2m_monthly_1',
	PRODUCT_AKISMET_PRO_500_MONTHLY: 'ak_pro5h_monthly',
	PRODUCT_AKISMET_PRO_500_YEARLY: 'ak_pro5h_yearly',
	PRODUCT_AKISMET_PRO_500_BI_YEARLY: 'ak_pro5h_bi_yearly',
	PRODUCT_AKISMET_BUSINESS_5K_MONTHLY: 'ak_bus5k_monthly',
	PRODUCT_AKISMET_BUSINESS_5K_YEARLY: 'ak_bus5k_yearly',
	PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY: 'ak_bus5k_bi_yearly',
	PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY: 'ak_ep15k_monthly',
	PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY: 'ak_ep15k_yearly',
	PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY: 'ak_ep15k_bi_yearly',
	PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY: 'ak_ep25k_monthly',
	PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY: 'ak_ep25k_yearly',
	PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY: 'ak_ep25k_bi_yearly',
} as const;

export const JetpackPlans = {
	PLAN_JETPACK_FREE: 'jetpack_free',
	PLAN_JETPACK_PERSONAL: 'jetpack_personal',
	PLAN_JETPACK_PERSONAL_MONTHLY: 'jetpack_personal_monthly',
	PLAN_JETPACK_PREMIUM: 'jetpack_premium',
	PLAN_JETPACK_PREMIUM_MONTHLY: 'jetpack_premium_monthly',
	PLAN_JETPACK_BUSINESS: 'jetpack_business',
	PLAN_JETPACK_BUSINESS_MONTHLY: 'jetpack_business_monthly',
	PLAN_JETPACK_SECURITY_T1_YEARLY: 'jetpack_security_t1_yearly',
	PLAN_JETPACK_SECURITY_T1_MONTHLY: 'jetpack_security_t1_monthly',
	PLAN_JETPACK_SECURITY_T1_BI_YEARLY: 'jetpack_security_t1_bi_yearly',
	PLAN_JETPACK_SECURITY_T2_YEARLY: 'jetpack_security_t2_yearly',
	PLAN_JETPACK_SECURITY_T2_MONTHLY: 'jetpack_security_t2_monthly',
	PLAN_JETPACK_COMPLETE_BI_YEARLY: 'jetpack_complete_bi_yearly',
	PLAN_JETPACK_COMPLETE: 'jetpack_complete',
	PLAN_JETPACK_COMPLETE_MONTHLY: 'jetpack_complete_monthly',
	PLAN_JETPACK_STARTER_YEARLY: 'jetpack_starter_yearly',
	PLAN_JETPACK_STARTER_MONTHLY: 'jetpack_starter_monthly',
	PLAN_JETPACK_GOLDEN_TOKEN: 'jetpack_golden_token_lifetime',
	PLAN_JETPACK_GROWTH_MONTHLY: 'jetpack_growth_monthly',
	PLAN_JETPACK_GROWTH_YEARLY: 'jetpack_growth_yearly',
	PLAN_JETPACK_GROWTH_BI_YEARLY: 'jetpack_growth_bi_yearly',
	PLAN_JETPACK_SECURITY_DAILY: 'jetpack_security_daily',
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY: 'jetpack_security_daily_monthly',
	PLAN_JETPACK_SECURITY_REALTIME: 'jetpack_security_realtime',
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY: 'jetpack_security_realtime_monthly',
} as const;

export const WPCOM_DIFM_LITE = 'wp_difm_lite';

export const PRODUCT_1GB_SPACE = 'wordpress_com_1gb_space_addon_yearly';
export const PRODUCT_WPCOM_SEARCH = 'wpcom_search';
export const PRODUCT_WPCOM_SEARCH_MONTHLY = 'wpcom_search_monthly';
export const PRODUCT_WPCOM_CUSTOM_DESIGN = 'custom-design';
export const PRODUCT_WPCOM_UNLIMITED_THEMES = 'unlimited_themes';

export const ADD_ON_JETPACK_AI_MONTHLY = 'jetpack_ai_monthly-add-on';
export const ADD_ON_UNLIMITED_THEMES = 'unlimited_themes-add-on';
export const ADD_ON_CUSTOM_DESIGN = 'custom_design-add-on';
export const ADD_ON_50GB_STORAGE = '50gb-storage-add-on';
export const ADD_ON_100GB_STORAGE = '100gb-storage-add-on';
export const ADD_ON_150GB_STORAGE = '150gb-storage-add-on';
export const ADD_ON_200GB_STORAGE = '200gb-storage-add-on';
export const ADD_ON_250GB_STORAGE = '250gb-storage-add-on';
export const ADD_ON_300GB_STORAGE = '300gb-storage-add-on';
export const ADD_ON_350GB_STORAGE = '350gb-storage-add-on';

export const OFFSITE_REDIRECT = 'offsite_redirect';

export const AkismetUpgradesProductMap: Record< string, string > = {
	[ AkismetPlans.PRODUCT_AKISMET_FREE ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_PERSONAL_YEARLY }:-q-36`,
	// This upgrade path should never be used in it's current form, PRODUCT_AKISMET_PERSONAL_MONTHLY is not a sellable product
	[ AkismetPlans.PRODUCT_AKISMET_PERSONAL_MONTHLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_PRO_500_MONTHLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_PERSONAL_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_PRO_500_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_PRO_500_MONTHLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_MONTHLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_PRO_500_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_PRO_500_BI_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_MONTHLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_BUSINESS_5K_BI_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_MONTHLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_15K_BI_YEARLY ]: `/checkout/akismet/${ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY }`,
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_MONTHLY ]: 'https://akismet.com/enterprise',
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_YEARLY ]: 'https://akismet.com/enterprise',
	[ AkismetPlans.PRODUCT_AKISMET_ENTERPRISE_25K_BI_YEARLY ]: 'https://akismet.com/enterprise',
};

export const ProductUpgradeMap: Record< string, string > = {
	[ JetpackPlans.PLAN_JETPACK_STARTER_YEARLY ]: JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
	[ JetpackPlans.PLAN_JETPACK_STARTER_MONTHLY ]: JetpackPlans.PLAN_JETPACK_SECURITY_T1_MONTHLY,
	[ JetpackPlans.PLAN_JETPACK_GROWTH_BI_YEARLY ]: JetpackPlans.PLAN_JETPACK_COMPLETE_BI_YEARLY,
	[ JetpackPlans.PLAN_JETPACK_GROWTH_YEARLY ]: JetpackPlans.PLAN_JETPACK_COMPLETE,
	[ JetpackPlans.PLAN_JETPACK_GROWTH_MONTHLY ]: JetpackPlans.PLAN_JETPACK_COMPLETE_MONTHLY,
};

export const DomainProductSlugs = {
	TRANSFER_IN: 'domain_transfer',
	DOTCOM_DOMAIN_REGISTRATION: 'domain_reg',
	DOMAIN_MOVE_INTERNAL: 'domain_move_internal',
} as const;

export const TitanMailSlugs = {
	TITAN_MAIL_MONTHLY_SLUG: 'wp_titan_mail_monthly',
	TITAN_MAIL_YEARLY_SLUG: 'wp_titan_mail_yearly',
} as const;

export const GoogleWorkspaceSlugs = {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY: 'wp_google_workspace_business_starter_monthly',
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY: 'wp_google_workspace_business_starter_yearly',
	GSUITE_BASIC_SLUG: 'gapps',
	GSUITE_BUSINESS_SLUG: 'gapps_unlimited',
	GSUITE_EXTRA_LICENSE_SLUG: 'gapps_extra_license',
} as const;

export const useMyDomainInputMode = {
	domainInput: 'domain-input' as const,
	transferOrConnect: 'transfer-or-connect' as const,
	ownershipVerification: 'ownership-verification' as const,
	transferDomain: 'transfer-domain' as const,
	startPendingTransfer: 'start-pending-transfer' as const,
} as const;

/*
 * Note that GMAIL only sets up email-related records,
 * while G_SUITE also adds a verification record.
 */
export const DnsTemplates = {
	GMAIL: {
		PROVIDER: 'g-suite',
		SERVICE: 'gmail',
	},
	G_SUITE: {
		PROVIDER: 'g-suite',
		SERVICE: 'G-Suite',
	},
	ICLOUD_MAIL: {
		PROVIDER: 'apple-icloud-mail',
		SERVICE: 'icloud-mail',
	},
	MICROSOFT_OFFICE365: {
		PROVIDER: 'microsoft-office365',
		SERVICE: 'O365',
	},
	TITAN: {
		PROVIDER: 'titan-mail',
		SERVICE: 'titan',
	},
	ZOHO_MAIL: {
		PROVIDER: 'zoho-mail',
		SERVICE: 'Zoho',
	},
};

export const getDataCenterOptions = (): Record< DataCenterOption, string > => ( {
	bur: __( 'US West (Burbank, California)' ),
	dfw: __( 'US Central (Dallas-Fort Worth, Texas)' ),
	dca: __( 'US East (Washington, D.C.)' ),
	ams: __( 'EU West (Amsterdam, Netherlands)' ),
} );

export const getPlanNames = () => ( {
	[ DotcomPlans.BUSINESS ]: __( 'Business' ),
	[ DotcomPlans.ECOMMERCE ]: __( 'Commerce' ),
	[ DotcomPlans.PREMIUM ]: __( 'Premium' ),
} );

export const PaymentPartners = {
	PAYPAL_EXPRESS: 'paypal_express',
	PAYPAL_PPCP: 'paypal_ppcp',
	RAZORPAY: 'razorpay',
} as const;

const PRODUCT_JETPACK_AI_BI_YEARLY = 'jetpack_ai_bi_yearly';
const PRODUCT_JETPACK_AI_MONTHLY = 'jetpack_ai_monthly';
const PRODUCT_JETPACK_AI_YEARLY = 'jetpack_ai_yearly';
const PRODUCT_JETPACK_ANTI_SPAM = 'jetpack_anti_spam';
const PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY = 'jetpack_anti_spam_bi_yearly';
const PRODUCT_JETPACK_ANTI_SPAM_MONTHLY = 'jetpack_anti_spam_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY =
	'jetpack_backup_addon_storage_100gb_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY =
	'jetpack_backup_addon_storage_100gb_yearly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY =
	'jetpack_backup_addon_storage_10gb_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY = 'jetpack_backup_addon_storage_10gb_yearly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY = 'jetpack_backup_addon_storage_1tb_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY = 'jetpack_backup_addon_storage_1tb_yearly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY = 'jetpack_backup_addon_storage_3tb_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY = 'jetpack_backup_addon_storage_3tb_yearly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY = 'jetpack_backup_addon_storage_5tb_monthly';
const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY = 'jetpack_backup_addon_storage_5tb_yearly';
export const PRODUCT_JETPACK_BACKUP_DAILY = 'jetpack_backup_daily';
export const PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY = 'jetpack_backup_daily_monthly';
export const PRODUCT_JETPACK_BACKUP_REALTIME = 'jetpack_backup_realtime';
export const PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY = 'jetpack_backup_realtime_monthly';
export const PRODUCT_JETPACK_BACKUP_T0_MONTHLY = 'jetpack_backup_t0_monthly';
export const PRODUCT_JETPACK_BACKUP_T0_YEARLY = 'jetpack_backup_t0_yearly';
export const PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY = 'jetpack_backup_t1_bi_yearly';
export const PRODUCT_JETPACK_BACKUP_T1_MONTHLY = 'jetpack_backup_t1_monthly';
export const PRODUCT_JETPACK_BACKUP_T1_YEARLY = 'jetpack_backup_t1_yearly';
export const PRODUCT_JETPACK_BACKUP_T2_MONTHLY = 'jetpack_backup_t2_monthly';
export const PRODUCT_JETPACK_BACKUP_T2_YEARLY = 'jetpack_backup_t2_yearly';
const PRODUCT_JETPACK_BOOST = 'jetpack_boost_yearly';
const PRODUCT_JETPACK_BOOST_BI_YEARLY = 'jetpack_boost_bi_yearly';
const PRODUCT_JETPACK_BOOST_MONTHLY = 'jetpack_boost_monthly';
const PRODUCT_JETPACK_CREATOR_BI_YEARLY = 'jetpack_creator_bi_yearly';
const PRODUCT_JETPACK_CREATOR_MONTHLY = 'jetpack_creator_monthly';
const PRODUCT_JETPACK_CREATOR_YEARLY = 'jetpack_creator_yearly';
const PRODUCT_JETPACK_MONITOR_MONTHLY = 'jetpack_monitor_monthly';
const PRODUCT_JETPACK_MONITOR_YEARLY = 'jetpack_monitor_yearly';
const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
const PRODUCT_JETPACK_SCAN_BI_YEARLY = 'jetpack_scan_bi_yearly';
const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';
const PRODUCT_JETPACK_SCAN_REALTIME = 'jetpack_scan_realtime';
const PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY = 'jetpack_scan_realtime_monthly';
const PRODUCT_JETPACK_SOCIAL_ADVANCED = 'jetpack_social_advanced_yearly';
const PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY = 'jetpack_social_advanced_bi_yearly';
const PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY = 'jetpack_social_advanced_monthly';
const PRODUCT_JETPACK_SOCIAL_BASIC = 'jetpack_social_basic_yearly';
const PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY = 'jetpack_social_basic_bi_yearly';
const PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY = 'jetpack_social_basic_monthly';
const PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY = 'jetpack_social_v1_bi_yearly';
const PRODUCT_JETPACK_SOCIAL_V1_MONTHLY = 'jetpack_social_v1_monthly';
const PRODUCT_JETPACK_SOCIAL_V1_YEARLY = 'jetpack_social_v1_yearly';
const PRODUCT_JETPACK_STATS_BI_YEARLY = 'jetpack_stats_bi_yearly';
const PRODUCT_JETPACK_STATS_FREE = 'jetpack_stats_free_yearly';
const PRODUCT_JETPACK_STATS_MONTHLY = 'jetpack_stats_monthly';
const PRODUCT_JETPACK_STATS_PWYW_YEARLY = 'jetpack_stats_pwyw_yearly';
const PRODUCT_JETPACK_STATS_YEARLY = 'jetpack_stats_yearly';
const PRODUCT_JETPACK_VIDEOPRESS = 'jetpack_videopress';
const PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY = 'jetpack_videopress_bi_yearly';
const PRODUCT_JETPACK_VIDEOPRESS_MONTHLY = 'jetpack_videopress_monthly';
const PRODUCT_JETPACK_SEARCH_FREE = 'jetpack_search_free';
const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
const PRODUCT_JETPACK_SEARCH_BI_YEARLY = 'jetpack_search_bi_yearly';
const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';

export const JETPACK_SEARCH_PRODUCTS = [
	PRODUCT_JETPACK_SEARCH_BI_YEARLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SEARCH_FREE,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_PERSONAL = 'personal-bundle';

// Anti-spam
export const JETPACK_ANTI_SPAM_PRODUCTS = < const >[
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
];

// Backup
const JETPACK_BACKUP_PRODUCTS_YEARLY = < const >[
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
];

const JETPACK_BACKUP_PRODUCTS_MONTHLY = < const >[
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T0_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
];

export const JETPACK_BACKUP_PRODUCTS = < const >[
	PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_YEARLY,
	...JETPACK_BACKUP_PRODUCTS_MONTHLY,
];

// Boost
const JETPACK_BOOST_PRODUCTS = < const >[
	PRODUCT_JETPACK_BOOST_BI_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_BOOST_MONTHLY,
];

// Scan
export const JETPACK_SCAN_PRODUCTS = < const >[
	PRODUCT_JETPACK_SCAN_BI_YEARLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	PRODUCT_JETPACK_SCAN_REALTIME,
	PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY,
];

// VideoPress
const JETPACK_VIDEOPRESS_PRODUCTS = < const >[
	PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
];

// Stats
const JETPACK_STATS_PRODUCTS = < const >[
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
];

// Social Basic
const JETPACK_SOCIAL_BASIC_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
];

// Social Advanced
const JETPACK_SOCIAL_ADVANCED_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
];

const JETPACK_SOCIAL_V1_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_MONTHLY,
];

// Social
const JETPACK_SOCIAL_PRODUCTS = < const >[
	...JETPACK_SOCIAL_BASIC_PRODUCTS,
	...JETPACK_SOCIAL_ADVANCED_PRODUCTS,
	...JETPACK_SOCIAL_V1_PRODUCTS,
];

// Jetpack Backup Add-on products
const JETPACK_BACKUP_ADDON_MONTHLY = < const >[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
];
const JETPACK_BACKUP_ADDON_YEARLY = < const >[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
];
const JETPACK_BACKUP_ADDON_PRODUCTS = < const >[
	...JETPACK_BACKUP_ADDON_MONTHLY,
	...JETPACK_BACKUP_ADDON_YEARLY,
];

// AI Products
const JETPACK_AI_PRODUCTS = < const >[
	PRODUCT_JETPACK_AI_BI_YEARLY,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_AI_YEARLY,
];

// Monitor
const JETPACK_MONITOR_PRODUCTS = < const >[
	PRODUCT_JETPACK_MONITOR_YEARLY,
	PRODUCT_JETPACK_MONITOR_MONTHLY,
];

// Creator
const JETPACK_CREATOR_PRODUCTS = < const >[
	PRODUCT_JETPACK_CREATOR_BI_YEARLY,
	PRODUCT_JETPACK_CREATOR_YEARLY,
	PRODUCT_JETPACK_CREATOR_MONTHLY,
];

// All Jetpack Products
export const JETPACK_PRODUCTS_LIST = < const >[
	...JETPACK_BACKUP_PRODUCTS,
	...JETPACK_BOOST_PRODUCTS,
	...JETPACK_SCAN_PRODUCTS,
	...JETPACK_ANTI_SPAM_PRODUCTS,
	...JETPACK_SEARCH_PRODUCTS,
	...JETPACK_VIDEOPRESS_PRODUCTS,
	...JETPACK_SOCIAL_PRODUCTS,
	...JETPACK_BACKUP_ADDON_PRODUCTS,
	...JETPACK_AI_PRODUCTS,
	...JETPACK_STATS_PRODUCTS,
	...JETPACK_MONITOR_PRODUCTS,
	...JETPACK_CREATOR_PRODUCTS,
	...JETPACK_SOCIAL_V1_PRODUCTS,
];

// Jetpack Complete plans
export const JETPACK_COMPLETE_PLANS = < const >[
	JetpackPlans.PLAN_JETPACK_COMPLETE_BI_YEARLY,
	JetpackPlans.PLAN_JETPACK_COMPLETE,
	JetpackPlans.PLAN_JETPACK_COMPLETE_MONTHLY,
];
