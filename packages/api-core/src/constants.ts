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

export const PRODUCT_JETPACK_AI_BI_YEARLY = 'jetpack_ai_bi_yearly';
export const PRODUCT_JETPACK_AI_MONTHLY = 'jetpack_ai_monthly';
export const PRODUCT_JETPACK_AI_YEARLY = 'jetpack_ai_yearly';
export const PRODUCT_JETPACK_ANTI_SPAM = 'jetpack_anti_spam';
export const PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY = 'jetpack_anti_spam_bi_yearly';
export const PRODUCT_JETPACK_ANTI_SPAM_MONTHLY = 'jetpack_anti_spam_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY =
	'jetpack_backup_addon_storage_100gb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY =
	'jetpack_backup_addon_storage_100gb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY =
	'jetpack_backup_addon_storage_10gb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY =
	'jetpack_backup_addon_storage_10gb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY =
	'jetpack_backup_addon_storage_1tb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY =
	'jetpack_backup_addon_storage_1tb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY =
	'jetpack_backup_addon_storage_3tb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY =
	'jetpack_backup_addon_storage_3tb_yearly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY =
	'jetpack_backup_addon_storage_5tb_monthly';
export const PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY =
	'jetpack_backup_addon_storage_5tb_yearly';
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
export const PRODUCT_JETPACK_BOOST = 'jetpack_boost_yearly';
export const PRODUCT_JETPACK_BOOST_BI_YEARLY = 'jetpack_boost_bi_yearly';
export const PRODUCT_JETPACK_BOOST_MONTHLY = 'jetpack_boost_monthly';
export const PRODUCT_JETPACK_CREATOR_BI_YEARLY = 'jetpack_creator_bi_yearly';
export const PRODUCT_JETPACK_CREATOR_MONTHLY = 'jetpack_creator_monthly';
export const PRODUCT_JETPACK_CREATOR_YEARLY = 'jetpack_creator_yearly';
export const PRODUCT_JETPACK_MONITOR_MONTHLY = 'jetpack_monitor_monthly';
export const PRODUCT_JETPACK_MONITOR_YEARLY = 'jetpack_monitor_yearly';
export const PRODUCT_JETPACK_SCAN = 'jetpack_scan';
export const PRODUCT_JETPACK_SCAN_BI_YEARLY = 'jetpack_scan_bi_yearly';
export const PRODUCT_JETPACK_SCAN_MONTHLY = 'jetpack_scan_monthly';
export const PRODUCT_JETPACK_SCAN_REALTIME = 'jetpack_scan_realtime';
export const PRODUCT_JETPACK_SCAN_REALTIME_MONTHLY = 'jetpack_scan_realtime_monthly';
export const PRODUCT_JETPACK_SOCIAL_ADVANCED = 'jetpack_social_advanced_yearly';
export const PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY = 'jetpack_social_advanced_bi_yearly';
export const PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY = 'jetpack_social_advanced_monthly';
export const PRODUCT_JETPACK_SOCIAL_BASIC = 'jetpack_social_basic_yearly';
export const PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY = 'jetpack_social_basic_bi_yearly';
export const PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY = 'jetpack_social_basic_monthly';
export const PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY = 'jetpack_social_v1_bi_yearly';
export const PRODUCT_JETPACK_SOCIAL_V1_MONTHLY = 'jetpack_social_v1_monthly';
export const PRODUCT_JETPACK_SOCIAL_V1_YEARLY = 'jetpack_social_v1_yearly';
export const PRODUCT_JETPACK_STATS_BI_YEARLY = 'jetpack_stats_bi_yearly';
export const PRODUCT_JETPACK_STATS_FREE = 'jetpack_stats_free_yearly';
export const PRODUCT_JETPACK_STATS_MONTHLY = 'jetpack_stats_monthly';
export const PRODUCT_JETPACK_STATS_PWYW_YEARLY = 'jetpack_stats_pwyw_yearly';
export const PRODUCT_JETPACK_STATS_YEARLY = 'jetpack_stats_yearly';
export const PRODUCT_JETPACK_VIDEOPRESS = 'jetpack_videopress';
export const PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY = 'jetpack_videopress_bi_yearly';
export const PRODUCT_JETPACK_VIDEOPRESS_MONTHLY = 'jetpack_videopress_monthly';
export const PRODUCT_JETPACK_CRM = 'jetpack_crm';
export const PRODUCT_JETPACK_CRM_MONTHLY = 'jetpack_crm';
export const PRODUCT_JETPACK_SEARCH_FREE = 'jetpack_search_free';
export const PRODUCT_JETPACK_SEARCH = 'jetpack_search';
export const PRODUCT_JETPACK_SEARCH_BI_YEARLY = 'jetpack_search_bi_yearly';
export const PRODUCT_JETPACK_SEARCH_MONTHLY = 'jetpack_search_monthly';

export const JETPACK_SEARCH_PRODUCTS = [
	PRODUCT_JETPACK_SEARCH_BI_YEARLY,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_JETPACK_SEARCH_FREE,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
];

// WPCom features constants
export const FEATURE_13GB_STORAGE = '13gb-storage';
export const FEATURE_1GB_STORAGE = '1gb-storage';
export const FEATURE_200GB_STORAGE = '200gb-storage';
export const FEATURE_3GB_STORAGE = '3gb-storage';
export const FEATURE_50GB_STORAGE = '50gb-storage';
export const FEATURE_6GB_STORAGE = '6gb-storage';
export const FEATURE_ADVANCED_DESIGN_CUSTOMIZATION = 'advanced-design-customization';
export const FEATURE_ADVANCED_SEO = 'advanced-seo';
export const FEATURE_ADVANCED_SEO_EXPANDED_ABBR = 'advanced-seo-expanded-abbreviation';
export const FEATURE_ADVANCED_SEO_TOOLS = 'advanced-seo-tools';
export const FEATURE_ALL_FREE_FEATURES = 'all-free-features';
export const FEATURE_ALL_FREE_FEATURES_JETPACK = 'all-free-features-jetpack';
export const FEATURE_ALL_PERSONAL_FEATURES = 'all-personal-features';
export const FEATURE_ALL_PERSONAL_FEATURES_JETPACK = 'all-personal-features-jetpack';
export const FEATURE_ALL_PREMIUM_FEATURES = 'all-premium-features';
export const FEATURE_ALL_PREMIUM_FEATURES_JETPACK = 'all-premium-features-jetpack';
export const FEATURE_AUDIO_UPLOADS = 'audio-upload';
export const FEATURE_BLOG_DOMAIN = 'blog-domain';
export const FEATURE_COMMUNITY_SUPPORT = 'community-support';
export const FEATURE_CUSTOM_DOMAIN = 'custom-domain';
export const FEATURE_EARN_AD = 'earn-ad-revenue';
export const FEATURE_EMAIL_FORWARDING_EXTENDED_LIMIT = 'email-forwarding-extended-limit';
export const FEATURE_FREE_BLOG_DOMAIN = 'free-blog-domain';
export const FEATURE_FREE_DOMAIN = 'free-custom-domain';
export const FEATURE_FREE_THEMES = 'free-themes';
export const FEATURE_FREE_THEMES_SIGNUP = 'free-themes-signup';
export const FEATURE_GOOGLE_ANALYTICS = 'google-analytics';
export const FEATURE_GOOGLE_MY_BUSINESS = 'google-my-business';
export const FEATURE_HOSTING = 'hosting';
export const FEATURE_INSTALL_PLUGINS = 'install-plugins';
export const FEATURE_JETPACK_ADVANCED = 'jetpack-advanced';
export const FEATURE_JETPACK_ESSENTIAL = 'jetpack-essential';
export const FEATURE_MEMBERSHIPS = 'memberships';
export const FEATURE_MONETISE = 'monetise-your-site';
export const FEATURE_NO_ADS = 'no-adverts';
export const FEATURE_NO_BRANDING = 'no-wp-branding';
export const FEATURE_PREMIUM_CONTENT_BLOCK = 'premium-content-block';
export const FEATURE_PREMIUM_CONTENT_CONTAINER = 'premium-content/container';
export const FEATURE_PREMIUM_SUPPORT = 'priority-support';
export const FEATURE_PREMIUM_THEMES = 'premium-themes-v3';
export const FEATURE_RECURRING_PAYMENTS = 'recurring-payments';
export const FEATURE_REPUBLICIZE = 'republicize';
export const FEATURE_SEAMLESS_STAGING_PRODUCTION_SYNCING = 'seamless-staging-production-syncing';
export const FEATURE_SFTP_DATABASE = 'sftp-and-database-access';
export const FEATURE_SIMPLE_PAYMENTS = 'simple-payments';
export const FEATURE_SITE_BACKUPS_AND_RESTORE = 'site-backups-and-restore';
export const FEATURE_SITE_STAGING_SITES = 'staging-sites';
export const FEATURE_STATS_COMMERCIAL = 'stats-commercial';
export const FEATURE_STATS_PAID = 'stats-paid';
export const FEATURE_UNLIMITED_STORAGE = 'unlimited-storage';
export const FEATURE_UPLOAD_PLUGINS = 'upload-plugins';
export const FEATURE_UPLOAD_THEMES = 'upload-themes';
export const FEATURE_UPLOAD_THEMES_PLUGINS = 'upload-themes-and-plugins';
export const FEATURE_VIDEO_UPLOADS = 'video-upload';
export const FEATURE_VIDEO_UPLOADS_JETPACK_PRO = 'video-upload-jetpack-pro';
export const FEATURE_WORDADS_INSTANT = 'wordads-instant';
export const FEATURE_WP_SUBDOMAIN = 'wordpress-subdomain';
export const FEATURE_WP_SUBDOMAIN_SIGNUP = 'wordpress-subdomain-signup';
export const PREMIUM_DESIGN_FOR_STORES = 'premium-design-for-stores';
export const WPCOM_FEATURES_AI_ASSISTANT = 'ai-assistant';
export const WPCOM_FEATURES_AKISMET = 'akismet';
export const WPCOM_FEATURES_ANTISPAM = 'antispam';
export const WPCOM_FEATURES_ATOMIC = 'atomic';
export const WPCOM_FEATURES_BACKUPS = 'backups';
export const WPCOM_FEATURES_BACKUPS_RESTORE = 'restore';
export const WPCOM_FEATURES_CLASSIC_SEARCH = 'search';
export const WPCOM_FEATURES_COMMUNITY_THEMES = 'community-themes';
export const WPCOM_FEATURES_COPY_SITE = 'copy-site';
export const WPCOM_FEATURES_CUSTOM_DESIGN = 'custom-design';
export const WPCOM_FEATURES_FULL_ACTIVITY_LOG = 'full-activity-log';
export const WPCOM_FEATURES_GITHUB_DEPLOYMENTS = 'github-deployments';
export const WPCOM_FEATURES_GLOBAL_STYLES = 'global-styles';
export const WPCOM_FEATURES_INSTALL_PLUGINS = 'install-plugins';
export const WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS = 'install-purchased-plugins';
export const WPCOM_FEATURES_INSTANT_SEARCH = 'instant-search';
export const WPCOM_FEATURES_LEGACY_CONTACT = 'legacy-contact';
export const WPCOM_FEATURES_LIVE_SUPPORT = 'live_support';
export const WPCOM_FEATURES_LOCKED_MODE = 'locked-mode';
export const WPCOM_FEATURES_MANAGE_PLUGINS = 'manage-plugins';
export const WPCOM_FEATURES_NO_ADVERTS = 'no-adverts/no-adverts.php';
export const WPCOM_FEATURES_NO_WPCOM_BRANDING = 'no-wpcom-branding';
export const WPCOM_FEATURES_PARTNER_THEMES = 'partner-themes';
export const WPCOM_FEATURES_PREMIUM_THEMES_LIMITED = 'personal-themes';
export const WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED = 'premium-themes';
export const WPCOM_FEATURES_PRIORITY_SUPPORT = 'priority_support';
export const WPCOM_FEATURES_REAL_TIME_BACKUPS = 'real-time-backups';
export const WPCOM_FEATURES_SCAN = 'scan';
export const WPCOM_FEATURES_SCHEDULED_UPDATES = 'scheduled-updates';
export const WPCOM_FEATURES_SENSEI_THEMES = 'sensei-themes';
export const WPCOM_FEATURES_SEO_PREVIEW_TOOLS = 'seo-preview-tools';
export const WPCOM_FEATURES_SITE_PREVIEW_LINKS = 'site-preview-links';
export const WPCOM_FEATURES_SUBSCRIPTION_GIFTING = 'subscription-gifting';
export const WPCOM_FEATURES_UPLOAD_AUDIO_FILES = 'upload-audio-files';
export const WPCOM_FEATURES_UPLOAD_PLUGINS = 'upload-plugins';
export const WPCOM_FEATURES_UPLOAD_VIDEO_FILES = 'upload-video-files';
export const WPCOM_FEATURES_VAULTPRESS_BACKUPS = 'vaultpress-backups';
export const WPCOM_FEATURES_VIDEO_HOSTING = 'video-hosting';
export const WPCOM_FEATURES_VIDEOPRESS = 'videopress';
export const WPCOM_FEATURES_VIDEOPRESS_UNLIMITED_STORAGE = 'videopress-unlimited-storage';
export const WPCOM_FEATURES_WOOCOMMERCE_THEMES = 'woocommerce-themes';
export const WPCOM_FEATURES_WORDADS = 'wordads';

// Jetpack features constants
export const FEATURE_ACCEPT_PAYMENTS = 'accept-payments';
export const FEATURE_ACTIVITY_LOG = 'site-activity-log';
export const FEATURE_ACTIVITY_LOG_1_YEAR_V2 = 'activity-log-1-year-v2';
export const FEATURE_ALL_BUSINESS_FEATURES = 'all-business-features';
export const FEATURE_ANTISPAM_V2 = 'antispam-v2';
export const FEATURE_AUTOMATED_RESTORES = 'automated-restores';
export const FEATURE_AUTOMATIC_SECURITY_FIXES = 'automatic-security-fixes';
export const FEATURE_BACKUP_ARCHIVE_30 = 'backup-archive-30';
export const FEATURE_BACKUP_ARCHIVE_UNLIMITED = 'backup-archive-unlimited';
export const FEATURE_BACKUP_DAILY_V2 = 'backup-daily-v2';
export const FEATURE_BACKUP_REALTIME_V2 = 'backup-realtime-v2';
export const FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED = 'backup-storage-space-unlimited';
export const FEATURE_BLANK = 'blank-feature';
export const FEATURE_CLOUD_CRITICAL_CSS = 'cloud-critical-css';
export const FEATURE_COLLECT_PAYMENTS_V2 = 'collect-payments-v2';
export const FEATURE_CRM_V2 = 'crm-v2';
export const FEATURE_EASY_SITE_MIGRATION = 'easy-site-migration';
export const FEATURE_ECOMMERCE_MARKETING = 'ecommerce-marketing';
export const FEATURE_FREE_WORDPRESS_THEMES = 'free-wordpress-themes';
export const FEATURE_JETPACK_ANTI_SPAM = PRODUCT_JETPACK_ANTI_SPAM;
export const FEATURE_JETPACK_ANTI_SPAM_BI_YEARLY = PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY;
export const FEATURE_JETPACK_ANTI_SPAM_MONTHLY = PRODUCT_JETPACK_ANTI_SPAM_MONTHLY;
export const FEATURE_JETPACK_BACKUP_DAILY = PRODUCT_JETPACK_BACKUP_DAILY;
export const FEATURE_JETPACK_BACKUP_DAILY_MONTHLY = PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY;
export const FEATURE_JETPACK_BACKUP_REALTIME = PRODUCT_JETPACK_BACKUP_REALTIME;
export const FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY = PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY;
export const FEATURE_JETPACK_BACKUP_T0_MONTHLY = PRODUCT_JETPACK_BACKUP_T0_MONTHLY;
export const FEATURE_JETPACK_BACKUP_T0_YEARLY = PRODUCT_JETPACK_BACKUP_T0_YEARLY;
export const FEATURE_JETPACK_BACKUP_T1_BI_YEARLY = PRODUCT_JETPACK_BACKUP_T1_BI_YEARLY;
export const FEATURE_JETPACK_BACKUP_T1_MONTHLY = PRODUCT_JETPACK_BACKUP_T1_MONTHLY;
export const FEATURE_JETPACK_BACKUP_T1_YEARLY = PRODUCT_JETPACK_BACKUP_T1_YEARLY;
export const FEATURE_JETPACK_BACKUP_T2_MONTHLY = PRODUCT_JETPACK_BACKUP_T2_MONTHLY;
export const FEATURE_JETPACK_BACKUP_T2_YEARLY = PRODUCT_JETPACK_BACKUP_T2_YEARLY;
export const FEATURE_JETPACK_BOOST = PRODUCT_JETPACK_BOOST;
export const FEATURE_JETPACK_BOOST_BI_YEARLY = PRODUCT_JETPACK_BOOST_BI_YEARLY;
export const FEATURE_JETPACK_BOOST_MONTHLY = PRODUCT_JETPACK_BOOST_MONTHLY;
export const FEATURE_JETPACK_CRM = PRODUCT_JETPACK_CRM;
export const FEATURE_JETPACK_CRM_MONTHLY = PRODUCT_JETPACK_CRM_MONTHLY;
export const FEATURE_JETPACK_SCAN_BI_YEARLY = PRODUCT_JETPACK_SCAN_BI_YEARLY;
export const FEATURE_JETPACK_SCAN_DAILY = PRODUCT_JETPACK_SCAN;
export const FEATURE_JETPACK_SCAN_DAILY_MONTHLY = PRODUCT_JETPACK_SCAN_MONTHLY;
export const FEATURE_JETPACK_SEARCH = PRODUCT_JETPACK_SEARCH;
export const FEATURE_JETPACK_SEARCH_BI_YEARLY = PRODUCT_JETPACK_SEARCH_BI_YEARLY;
export const FEATURE_JETPACK_SEARCH_MONTHLY = PRODUCT_JETPACK_SEARCH_MONTHLY;
export const FEATURE_JETPACK_SOCIAL_ADVANCED = PRODUCT_JETPACK_SOCIAL_ADVANCED;
export const FEATURE_JETPACK_SOCIAL_ADVANCED_BI_YEARLY = PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY;
export const FEATURE_JETPACK_SOCIAL_ADVANCED_MONTHLY = PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY;
export const FEATURE_JETPACK_SOCIAL_BASIC = PRODUCT_JETPACK_SOCIAL_BASIC;
export const FEATURE_JETPACK_SOCIAL_BASIC_BI_YEARLY = PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY;
export const FEATURE_JETPACK_SOCIAL_BASIC_MONTHLY = PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY;
export const FEATURE_JETPACK_SOCIAL_V1_BI_YEARLY = PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY;
export const FEATURE_JETPACK_SOCIAL_V1_MONTHLY = PRODUCT_JETPACK_SOCIAL_V1_MONTHLY;
export const FEATURE_JETPACK_SOCIAL_V1_YEARLY = PRODUCT_JETPACK_SOCIAL_V1_YEARLY;
export const FEATURE_JETPACK_VIDEOPRESS = PRODUCT_JETPACK_VIDEOPRESS;
export const FEATURE_JETPACK_VIDEOPRESS_BI_YEARLY = PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY;
export const FEATURE_JETPACK_VIDEOPRESS_EDITOR = 'jetpack-videopress-editor';
export const FEATURE_JETPACK_VIDEOPRESS_MONTHLY = PRODUCT_JETPACK_VIDEOPRESS_MONTHLY;
export const FEATURE_JETPACK_VIDEOPRESS_STORAGE = 'jetpack-videopress-storage';
export const FEATURE_JETPACK_VIDEOPRESS_UNBRANDED = 'jetpack-videopress-unbranded';
export const FEATURE_MALWARE_SCANNING_DAILY = 'malware-scanning-daily';
export const FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND = 'malware-scanning-daily-and-on-demand';
export const FEATURE_MANAGE = 'jetpack-manage';
export const FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY = 'offsite-backup-vaultpress-daily';
export const FEATURE_OFFSITE_BACKUP_VAULTPRESS_REALTIME = 'offsite-backup-vaultpress-realtime';
export const FEATURE_ONE_CLICK_THREAT_RESOLUTION = 'one-click-threat-resolution';
export const FEATURE_PLAN_SECURITY_DAILY = 'security-daily';
export const FEATURE_PREMIUM_CUSTOMIZABE_THEMES = 'premium-customizable-themes';
export const FEATURE_PRODUCT_BACKUP_DAILY_V2 = 'product-backup-daily-v2';
export const FEATURE_PRODUCT_BACKUP_REALTIME_V2 = 'product-backup-realtime-v2';
export const FEATURE_PRODUCT_SCAN_DAILY_V2 = 'product-scan-daily-v2';
export const FEATURE_PRODUCT_SCAN_REALTIME_V2 = 'product-scan-realtime-v2';
export const FEATURE_PRODUCT_SEARCH_V2 = 'product-search-v2';
export const FEATURE_SCAN_V2 = 'scan-v2';
export const FEATURE_SEO_PREVIEW_TOOLS = 'seo-preview-tools';
export const FEATURE_SHIPPING_CARRIERS = 'shipping-carriers';
export const FEATURE_SITE_STATS = 'site-stats';
export const FEATURE_SPAM_AKISMET_PLUS = 'spam-akismet-plus';
export const FEATURE_STANDARD_SECURITY_TOOLS = 'standard-security-tools';
export const FEATURE_TRAFFIC_TOOLS = 'traffic-tools';
export const FEATURE_UNLIMITED_PRODUCTS_SERVICES = 'unlimited-products-service';
export const FEATURE_WAF = 'waf';

// Jetpack tiered product features
export const FEATURE_JETPACK_1_YEAR_ARCHIVE_ACTIVITY_LOG = 'jetpack-1-year-archive-activity-log';
export const FEATURE_JETPACK_10GB_BACKUP_STORAGE = 'jetpack-10gb-backup-storage';
export const FEATURE_JETPACK_1GB_BACKUP_STORAGE = 'jetpack-1gb-backup-storage';
export const FEATURE_JETPACK_1TB_BACKUP_STORAGE = 'jetpack-1tb-backup-storage';
export const FEATURE_JETPACK_30_DAY_ARCHIVE_ACTIVITY_LOG = 'jetpack-30-day-archive-activity-log';
export const FEATURE_JETPACK_ALL_BACKUP_SECURITY_FEATURES = 'jetpack-all-backup-security-features';
export const FEATURE_JETPACK_PRODUCT_BACKUP = 'jetpack-product-backup';
export const FEATURE_JETPACK_PRODUCT_VIDEOPRESS = 'jetpack-product-videopress';
export const FEATURE_JETPACK_REAL_TIME_CLOUD_BACKUPS = 'jetpack-real-time-cloud-backups';
export const FEATURE_JETPACK_REAL_TIME_MALWARE_SCANNING = 'jetpack-real-time-malware-scanning';

// P2 project features
export const FEATURE_MANAGED_HOSTING = 'managed-hosting';
export const FEATURE_P2_13GB_STORAGE = 'p2-13gb-storage';
export const FEATURE_P2_3GB_STORAGE = 'p2-3gb-storage';
export const FEATURE_P2_ACTIVITY_OVERVIEW = 'p2-activity-overview';
export const FEATURE_P2_ADVANCED_SEARCH = 'p2-advanced-search';
export const FEATURE_P2_CUSTOMIZATION_OPTIONS = 'p2-customization-options';
export const FEATURE_P2_MORE_FILE_TYPES = 'p2-more-file-types';
export const FEATURE_P2_PRIORITY_CHAT_EMAIL_SUPPORT = 'p2-priority-chat-email-support';
export const FEATURE_P2_SIMPLE_SEARCH = 'p2-simple-search';
export const FEATURE_P2_UNLIMITED_POSTS_PAGES = 'p2-unlimited-posts-pages';
export const FEATURE_P2_UNLIMITED_USERS = 'p2-unlimited-users';
export const FEATURE_P2_VIDEO_SHARING = 'p2-video-sharing';
export const FEATURE_PAYMENT_BLOCKS = 'payment-blocks';
export const FEATURE_SOCIAL_MEDIA_TOOLS = 'social-media-tools';
export const FEATURE_TITAN_EMAIL = 'titan-email';
export const FEATURE_UNLIMITED_ADMINS = 'unlimited-admins';
export const FEATURE_UNLIMITED_POSTS_PAGES = 'unlimited-posts-pages';
export const FEATURE_UNLIMITED_USERS = 'unlimited-users';
export const FEATURE_WOOCOMMERCE = 'woocommerce';

// Signup flow related features
export const FEATURE_AD_FREE_EXPERIENCE = 'ad-free-experience';
export const FEATURE_GROUP_PAYMENT_TRANSACTION_FEES = 'payment-transaction-fees-group';
export const FEATURE_PAYMENT_TRANSACTION_FEES_0 = 'payment-transaction-fees-0';
export const FEATURE_PAYMENT_TRANSACTION_FEES_2 = 'payment-transaction-fees-2';
export const FEATURE_PAYMENT_TRANSACTION_FEES_4 = 'payment-transaction-fees-4';
export const FEATURE_PAYMENT_TRANSACTION_FEES_8 = 'payment-transaction-fees-8';
export const FEATURE_TRACK_VIEWS_CLICKS = 'track-views-clicks';
export const FEATURE_UNLIMITED_EMAILS = 'unlimited-emails';
export const FEATURE_UNLIMITED_SUBSCRIBERS = 'unlimited-subscribers';

// Pricing Grid 2023 Features
export const FEATURE_99_999_UPTIME = '99-999-uptime';
export const FEATURE_ACCEPT_PAYMENTS_V2 = 'accept-payments-v2';
export const FEATURE_AUTOMATED_BACKUPS_SECURITY_SCAN = 'automated-backups-security-scan';
export const FEATURE_AUTOMATIC_SALES_TAX = 'automatic-sales-tax';
export const FEATURE_AUTOMATTIC_DATACENTER_FAILOVER = 'automattic-datacenter-fail-over';
export const FEATURE_BACK_IN_STOCK_NOTIFICATIONS = 'back-in-stock-notifications';
export const FEATURE_CART_ABANDONMENT_EMAILS = 'cart-abandonment-emails';
export const FEATURE_CDN = 'cdn-v1';
export const FEATURE_CHECKOUT = 'checkout-v1';
export const FEATURE_CPUS = 'cpus-v1';
export const FEATURE_DEV_TOOLS = 'dev-tools';
export const FEATURE_DEV_TOOLS_GIT = 'dev-tools-git';
export const FEATURE_DEV_TOOLS_SSH = 'dev-tools-ssh';
export const FEATURE_DISPLAY_PRODUCTS_BRAND = 'display-products-brand';
export const FEATURE_EXTENSIONS = 'extensions-v1';
export const FEATURE_FAST_SUPPORT_FROM_EXPERTS = 'fast-support-from-experts';
export const FEATURE_INTEGRATED_SHIPMENT_TRACKING = 'integrated-shipment-tracking';
export const FEATURE_MARKETING_AUTOMATION = 'marketing-automation';
export const FEATURE_MIN_MAX_ORDER_QUANTITY = 'min-max-order-quantity';
export const FEATURE_PLUGINS_THEMES = 'plugins-themes-v1';
export const FEATURE_PRIORITY_24_7_SUPPORT = 'priority-24-7-support';
export const FEATURE_PRODUCT_ADD_ONS = 'product-add-ons';
export const FEATURE_REAL_TIME_SECURITY_SCANS = 'real-time-security-scans';
export const FEATURE_SALES_REPORTS = 'sales-reports';
export const FEATURE_SECURITY_DDOS = 'security-ddos';
export const FEATURE_SELL_SHIP = 'sell-ship';
export const FEATURE_STYLE_CUSTOMIZATION = 'style-customization';
export const FEATURE_UNLIMITED_TRAFFIC = 'unlimited-traffic';
export const FEATURE_WAF_V2 = 'waf-v2';
export const FEATURE_WORDADS = 'wordads-v2';

// WooExpress features
export const FEATURE_ABANDONED_CART_RECOVERY = 'abandoned-cart-recovery'; // Abandoned cart recovery
export const FEATURE_ACCEPT_LOCAL_PAYMENTS = 'accept-local-payments'; // Accept local payments
export const FEATURE_ADVERTISE_ON_GOOGLE = 'advertise-on-google'; // Advertise on Google
export const FEATURE_AI_ASSISTED_PRODUCT_DESCRIPTION = 'ai-assisted-product-descriptions'; // AI-assisted product descriptions
export const FEATURE_AUTOMATED_SALES_TAXES = 'automated-sales-taxes'; // Automated sales taxes
export const FEATURE_CONNECT_WITH_FACEBOOK = 'connect-with-facebook'; // Connect with Facebook
export const FEATURE_CUSTOM_ORDER_EMAILS = 'custom-order-emails'; // Custom order emails
export const FEATURE_DISCOUNTED_SHIPPING = 'discounted-shipping'; // Discounted shipping
export const FEATURE_FREE_SSL_CERTIFICATE = 'free-ssl-certificate'; // Free SSL certificate
export const FEATURE_GIFT_CARDS = 'gift-cards'; // Gift cards
export const FEATURE_GOOGLE_ANALYTICS_V3 = 'google-analytics-v3'; // Google Analytics
export const FEATURE_INTEGRATED_PAYMENTS = 'integrated-payments'; // Integrated payments
export const FEATURE_INTERNATIONAL_PAYMENTS = 'international-payments'; // International payments
export const FEATURE_LIST_PRODUCTS_BY_BRAND = 'list-products-by-brand'; // List products by brand
export const FEATURE_LIST_UNLIMITED_PRODUCTS = 'list-unlimited-products'; // List unlimited products
export const FEATURE_LIVE_SHIPPING_RATES = 'live-shipping-rates'; // Live shipping rates
export const FEATURE_PRINT_SHIPPING_LABELS = 'print-shipping-labels'; // Print shipping labels
export const FEATURE_PRODUCT_BUNDLES = 'product-bundles'; // Product bundles
export const FEATURE_PRODUCT_RECOMMENDATIONS = 'product-recommendations'; // Product recommendations
export const FEATURE_PROMOTE_ON_TIKTOK = 'promote-on-tiktok'; // Promote on TikTok
export const FEATURE_SYNC_WITH_PINTEREST = 'sync-with-pinterest'; // Sync with Pinterest
export const FEATURE_WOOCOMMERCE_MOBILE_APP = 'woocommerce-mobile-app'; // WooCommerce mobile app
export const FEATURE_WOOCOMMERCE_STORE = 'woocommerce-store'; // WooCommerce store
export const FEATURE_WORDPRESS_CMS = 'wordpress-cms'; // WordPress CMS
export const FEATURE_WORDPRESS_MOBILE_APP = 'wordpress-mobile-app'; // WordPress mobile app

export const FEATURE_GOOGLE_LISTING_ADS = 'feature-google-listing-ads';
export const FEATURE_WOO_AUTOMATE = 'feature-woo-automate';
export const FEATURE_WOO_SHIPPING_TRACKING = 'feature-woo-shipping-tracking';

/**
 * Plans
 */
export const PLAN_100_YEARS = 'wp_com_hundred_year_bundle_centennially';
export const PLAN_BLOGGER = 'blogger-bundle';
export const PLAN_BLOGGER_2_YEARS = 'blogger-bundle-2y';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_BUSINESS_2_YEARS = 'business-bundle-2y';
export const PLAN_BUSINESS_3_YEARS = 'business-bundle-3y';
export const PLAN_BUSINESS_MONTHLY = 'business-bundle-monthly';
export const PLAN_CHARGEBACK = 'chargeback';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';
export const PLAN_ECOMMERCE_2_YEARS = 'ecommerce-bundle-2y';
export const PLAN_ECOMMERCE_3_YEARS = 'ecommerce-bundle-3y';
export const PLAN_ECOMMERCE_MONTHLY = 'ecommerce-bundle-monthly';
export const PLAN_ECOMMERCE_TRIAL_MONTHLY = 'ecommerce-trial-bundle-monthly';
export const PLAN_ENTERPRISE_GRID_WPCOM = 'plan-enterprise-grid-wpcom'; // Not a real plan; we show the VIP section in the plans grid as part of pdgrnI-1Qp-p2.
export const PLAN_FREE = 'free_plan';
export const PLAN_HOST_BUNDLE = 'host-bundle';
export const PLAN_HOSTING_TRIAL_MONTHLY = 'wp_bundle_hosting_trial_monthly';
export const PLAN_MIGRATION_TRIAL_MONTHLY = 'wp_bundle_migration_trial_monthly';
export const PLAN_P2_FREE = 'p2_free_plan'; // Not a real plan; it's a renamed WP.com Free for the P2 project.
export const PLAN_P2_PLUS = 'wp_p2_plus_monthly';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PERSONAL_2_YEARS = 'personal-bundle-2y';
export const PLAN_PERSONAL_3_YEARS = 'personal-bundle-3y';
export const PLAN_PERSONAL_MONTHLY = 'personal-bundle-monthly';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_PREMIUM_2_YEARS = 'value_bundle-2y';
export const PLAN_PREMIUM_3_YEARS = 'value_bundle-3y';
export const PLAN_PREMIUM_MONTHLY = 'value_bundle_monthly';
export const PLAN_VIP = 'vip';
export const PLAN_WOO_HOSTED_BASIC = 'woo_hosted_basic_plan_yearly';
export const PLAN_WOO_HOSTED_BASIC_MONTHLY = 'woo_hosted_basic_plan_monthly';
export const PLAN_WOO_HOSTED_PRO = 'woo_hosted_pro_plan_yearly';
export const PLAN_WOO_HOSTED_PRO_MONTHLY = 'woo_hosted_pro_plan_monthly';
export const PLAN_WOOEXPRESS_MEDIUM = 'wooexpress-medium-bundle-yearly';
export const PLAN_WOOEXPRESS_MEDIUM_MONTHLY = 'wooexpress-medium-bundle-monthly';
export const PLAN_WOOEXPRESS_PLUS = 'wooexpress-plus'; // Not a real plan;
export const PLAN_WOOEXPRESS_SMALL = 'wooexpress-small-bundle-yearly';
export const PLAN_WOOEXPRESS_SMALL_MONTHLY = 'wooexpress-small-bundle-monthly';
export const PLAN_WPCOM_ENTERPRISE = 'wpcom-enterprise';
export const PLAN_WPCOM_FLEXIBLE = 'wpcom-flexible'; // Not a real plan; it's a renamed WP.com Free for the plans overhaul.
export const PLAN_WPCOM_PRO = 'pro-plan';
export const PLAN_WPCOM_PRO_2_YEARS = 'pro-plan-2y';
export const PLAN_WPCOM_PRO_MONTHLY = 'pro-plan-monthly';
export const PLAN_WPCOM_STARTER = 'starter-plan';

// Anti-spam
export const JETPACK_ANTI_SPAM_PRODUCTS = < const >[
	PRODUCT_JETPACK_ANTI_SPAM_BI_YEARLY,
	PRODUCT_JETPACK_ANTI_SPAM_MONTHLY,
	PRODUCT_JETPACK_ANTI_SPAM,
];

// Backup
export const JETPACK_BACKUP_PRODUCTS_YEARLY = < const >[
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T0_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
];

export const JETPACK_BACKUP_PRODUCTS_MONTHLY = < const >[
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
export const JETPACK_BOOST_PRODUCTS = < const >[
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
export const JETPACK_VIDEOPRESS_PRODUCTS = < const >[
	PRODUCT_JETPACK_VIDEOPRESS_BI_YEARLY,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
];

// Stats
export const JETPACK_STATS_PRODUCTS = < const >[
	PRODUCT_JETPACK_STATS_BI_YEARLY,
	PRODUCT_JETPACK_STATS_YEARLY,
	PRODUCT_JETPACK_STATS_MONTHLY,
	PRODUCT_JETPACK_STATS_PWYW_YEARLY,
	PRODUCT_JETPACK_STATS_FREE,
];

// Social Basic
export const JETPACK_SOCIAL_BASIC_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_BASIC_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_SOCIAL_BASIC_MONTHLY,
];

// Social Advanced
export const JETPACK_SOCIAL_ADVANCED_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_ADVANCED_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_ADVANCED,
	PRODUCT_JETPACK_SOCIAL_ADVANCED_MONTHLY,
];

export const JETPACK_SOCIAL_V1_PRODUCTS = < const >[
	PRODUCT_JETPACK_SOCIAL_V1_BI_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_YEARLY,
	PRODUCT_JETPACK_SOCIAL_V1_MONTHLY,
];

// Social
export const JETPACK_SOCIAL_PRODUCTS = < const >[
	...JETPACK_SOCIAL_BASIC_PRODUCTS,
	...JETPACK_SOCIAL_ADVANCED_PRODUCTS,
	...JETPACK_SOCIAL_V1_PRODUCTS,
];

// Jetpack Backup Add-on products
export const JETPACK_BACKUP_ADDON_MONTHLY = < const >[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_MONTHLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_MONTHLY,
];
export const JETPACK_BACKUP_ADDON_YEARLY = < const >[
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_10GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_100GB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_1TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_3TB_YEARLY,
	PRODUCT_JETPACK_BACKUP_ADDON_STORAGE_5TB_YEARLY,
];
export const JETPACK_BACKUP_ADDON_PRODUCTS = < const >[
	...JETPACK_BACKUP_ADDON_MONTHLY,
	...JETPACK_BACKUP_ADDON_YEARLY,
];

// AI Products
export const JETPACK_AI_PRODUCTS = < const >[
	PRODUCT_JETPACK_AI_BI_YEARLY,
	PRODUCT_JETPACK_AI_MONTHLY,
	PRODUCT_JETPACK_AI_YEARLY,
];

// Monitor
export const JETPACK_MONITOR_PRODUCTS = < const >[
	PRODUCT_JETPACK_MONITOR_YEARLY,
	PRODUCT_JETPACK_MONITOR_MONTHLY,
];

// Creator
export const JETPACK_CREATOR_PRODUCTS = < const >[
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

// Jetpack Legacy (before offer reset) plans
export const JETPACK_LEGACY_PLANS = < const >[
	JetpackPlans.PLAN_JETPACK_PERSONAL,
	JetpackPlans.PLAN_JETPACK_PERSONAL_MONTHLY,
	JetpackPlans.PLAN_JETPACK_BUSINESS,
	JetpackPlans.PLAN_JETPACK_BUSINESS_MONTHLY,
	JetpackPlans.PLAN_JETPACK_PREMIUM,
	JetpackPlans.PLAN_JETPACK_PREMIUM_MONTHLY,
];
// Jetpack Security plans
export const JETPACK_SECURITY_PLANS = < const >[
	JetpackPlans.PLAN_JETPACK_SECURITY_DAILY,
	JetpackPlans.PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_REALTIME,
	JetpackPlans.PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_T1_YEARLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_T1_MONTHLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_T1_BI_YEARLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_T2_YEARLY,
	JetpackPlans.PLAN_JETPACK_SECURITY_T2_MONTHLY,
];

// Jetpack Complete plans
export const JETPACK_COMPLETE_PLANS = < const >[
	JetpackPlans.PLAN_JETPACK_COMPLETE_BI_YEARLY,
	JetpackPlans.PLAN_JETPACK_COMPLETE,
	JetpackPlans.PLAN_JETPACK_COMPLETE_MONTHLY,
];
