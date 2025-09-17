import { __ } from '@wordpress/i18n';
import { DataCenterOption } from './site-hosting/types';

export const DotcomPlans = {
	BUSINESS: 'business-bundle',
	BUSINESS_MONTHLY: 'business-bundle-monthly',
	BUSINESS_2_YEARS: 'business-bundle-2y',
	BUSINESS_3_YEARS: 'business-bundle-3y',
	ECOMMERCE: 'ecommerce-bundle',
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

export type DotcomPlanSlug = ( typeof DotcomPlans )[ keyof typeof DotcomPlans ];

export const DotcomFeatures = {
	ATOMIC: 'atomic',
	BACKUPS: 'backups',
	SUBSCRIPTION_GIFTING: 'subscription-gifting',
	COPY_SITE: 'copy-site',
	LEGACY_CONTACT: 'legacy-contact',
	LOCKED_MODE: 'locked-mode',
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
	DEPLOYMENT: DotcomFeatures.ATOMIC,
	LOGS: DotcomFeatures.ATOMIC,
	MONITOR: DotcomFeatures.ATOMIC,
	PERFORMANCE: DotcomFeatures.ATOMIC,
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
} as const;

export const WPCOM_DIFM_LITE = 'wp_difm_lite';

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
