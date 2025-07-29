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
