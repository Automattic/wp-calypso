export const DOTCOM_OVERVIEW = 'dotcom-hosting';
export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_LOGS_PHP = 'dotcom-site-logs-php';
export const DOTCOM_LOGS_WEB = 'dotcom-site-logs-web';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_HOSTING_FEATURES = 'dotcom-hosting-features';
export const DOTCOM_STAGING_SITE = 'dotcom-staging-site';
export const DOTCOM_SITE_PERFORMANCE = 'dotcom-site-performance';

export const SITE_MARKETING_TOOLS = 'site-marketing-tools';
export const SITE_MARKETING_BUSINESS_TOOLS = 'site-marketing-business-tools';

export const SETTINGS_SITE = 'settings-site';
export const SETTINGS_ADMINISTRATION = 'settings-administration';
export const SETTINGS_AGENCY = 'settings-agency';
export const SETTINGS_CACHES = 'settings-caches';
export const SETTINGS_WEB_SERVER = 'settings-web-server';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOTCOM_OVERVIEW ]: 'overview/:site',
	[ DOTCOM_MONITORING ]: 'site-monitoring/:site',
	[ DOTCOM_LOGS_PHP ]: 'site-logs/:site/php',
	[ DOTCOM_LOGS_WEB ]: 'site-logs/:site/web',
	[ DOTCOM_GITHUB_DEPLOYMENTS ]: 'github-deployments/:site',
	[ DOTCOM_HOSTING_CONFIG ]: 'hosting-config/:site',
	[ DOTCOM_HOSTING_FEATURES ]: 'hosting-features/:site',
	[ DOTCOM_STAGING_SITE ]: 'staging-site/:site',
	[ DOTCOM_SITE_PERFORMANCE ]: 'sites/performance/:site',

	// New Information Architecture
	[ SITE_MARKETING_TOOLS ]: 'sites/marketing/tools/:site',
	[ SITE_MARKETING_BUSINESS_TOOLS ]: 'sites/marketing/business-tools/:site',
	[ SETTINGS_SITE ]: 'sites/settings/site/:site',
	[ SETTINGS_ADMINISTRATION ]: 'sites/settings/administration/:site',
	[ SETTINGS_AGENCY ]: 'sites/settings/agency/:site',
	[ SETTINGS_CACHES ]: 'sites/settings/caches/:site',
	[ SETTINGS_WEB_SERVER ]: 'sites/settings/web-server/:site',
};
