export enum DotcomFeatures {
	SUBSCRIPTION_GIFTING = 'subscription-gifting',
	COPY_SITE = 'copy-site',
	LEGACY_CONTACT = 'legacy-contact',
	LOCKED_MODE = 'locked-mode',
	SFTP = 'sftp',
	SSH = 'ssh',
	SITE_PREVIEW_LINKS = 'site-preview-links',
}

export enum DotcomPlans {
	BUSINESS = 'business-bundle',
	BUSINESS_MONTHLY = 'business-bundle-monthly',
	BUSINESS_2_YEARS = 'business-bundle-2y',
	BUSINESS_3_YEARS = 'business-bundle-3y',
	PREMIUM = 'value_bundle',
	PREMIUM_MONTHLY = 'value_bundle_monthly',
	PREMIUM_2_YEARS = 'value_bundle-2y',
	PREMIUM_3_YEARS = 'value_bundle-3y',
}

export const SITE_FIELDS = [
	'ID',
	'slug',
	'URL',
	'name',
	'icon',
	'subscribers_count',
	'plan',
	'capabilities',
	'is_a4a_dev_site',
	'is_a8c',
	'is_deleted',
	'is_coming_soon',
	'is_private',
	'is_wpcom_atomic',
	'is_wpcom_staging_site',
	'launch_status',
	'site_migration',
	'site_owner',
	'options',
	'jetpack',
	'jetpack_modules',
];

export const SITE_OPTIONS = [
	'admin_url',
	'is_redirect',
	'is_wpforteams_site',
	'p2_hub_blog_id',
	'site_creation_flow',
	'software_version',
];
