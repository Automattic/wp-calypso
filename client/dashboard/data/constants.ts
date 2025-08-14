export enum DotcomPlans {
	BUSINESS = 'business-bundle',
	BUSINESS_MONTHLY = 'business-bundle-monthly',
	BUSINESS_2_YEARS = 'business-bundle-2y',
	BUSINESS_3_YEARS = 'business-bundle-3y',
	ECOMMERCE_TRIAL_MONTHLY = 'ecommerce-trial-bundle-monthly',
	FREE_PLAN = 'free_plan',
	HOSTING_TRIAL_MONTHLY = 'wp_bundle_hosting_trial_monthly',
	JETPACK_FREE = 'jetpack_free',
	MIGRATION_TRIAL_MONTHLY = 'wp_bundle_migration_trial_monthly',
	PREMIUM = 'value_bundle',
	PREMIUM_MONTHLY = 'value_bundle_monthly',
	PREMIUM_2_YEARS = 'value_bundle-2y',
	PREMIUM_3_YEARS = 'value_bundle-3y',
}

export enum DotcomFeatures {
	ATOMIC = 'atomic',
	BACKUPS = 'backups',
	SUBSCRIPTION_GIFTING = 'subscription-gifting',
	COPY_SITE = 'copy-site',
	LEGACY_CONTACT = 'legacy-contact',
	LOCKED_MODE = 'locked-mode',
	SCAN = 'scan',
	SECURITY_SETTINGS = 'security-settings',
	SET_PRIMARY_CUSTOM_DOMAIN = 'set-primary-custom-domain',
	SFTP = 'sftp',
	SSH = 'ssh',
	SITE_PREVIEW_LINKS = 'site-preview-links',
	STAGING_SITES = 'staging-sites',
}

// Features that are used to identify the paid product.
// Feature slug extracted from https://github.com/Automattic/jetpack/tree/trunk/projects/packages/my-jetpack/src/products.
export enum JetpackFeatures {
	ANTISPAM = 'antispam',
	BACKUPS = 'backups',
	CLOUD_CRITICAL_CSS = 'cloud-critical-css',
	MONITOR = 'monitor',
	SCAN = 'scan',
	SOCIAL_ENHANCED_PUBLISHING = 'social-enhanced-publishing',
	STATS = 'stats-paid',
	SEARCH = 'search',
	VIDEOPRESS = 'videopress',
}

export enum JetpackModules {
	MONITOR = 'monitor',
	PROTECT = 'protect',
	STATS = 'stats',
	WAF = 'waf',
}

// Features that needs Atomic or self-hosted infrastructure,
// mapped to the required WordPress.com plan feature.
export enum HostingFeatures {
	BACKUPS = DotcomFeatures.BACKUPS,
	CACHING = DotcomFeatures.ATOMIC,
	DATABASE = DotcomFeatures.SFTP,
	DEFENSIVE_MODE = DotcomFeatures.SFTP,
	DEPLOYMENT = DotcomFeatures.ATOMIC,
	LOGS = DotcomFeatures.ATOMIC,
	MONITOR = DotcomFeatures.ATOMIC,
	PERFORMANCE = DotcomFeatures.ATOMIC,
	PHP = DotcomFeatures.SFTP,
	PRIMARY_DATA_CENTER = DotcomFeatures.SFTP,
	SCAN = DotcomFeatures.SCAN,
	SECURITY_SETTINGS = DotcomFeatures.SECURITY_SETTINGS,
	SFTP = DotcomFeatures.SFTP,
	SSH = DotcomFeatures.SSH,
	STAGING_SITE = DotcomFeatures.STAGING_SITES,
	STATIC_FILE_404 = DotcomFeatures.SFTP,
}

export const SubscriptionBillPeriod = {
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

export const WPCOM_DIFM_LITE = 'wp_difm_lite';
