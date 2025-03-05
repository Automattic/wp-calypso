export const DOTCOM_OVERVIEW = 'dotcom-hosting';
export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_LOGS_PHP = 'dotcom-site-logs-php';
export const DOTCOM_LOGS_WEB = 'dotcom-site-logs-web';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_HOSTING_FEATURES = 'dotcom-hosting-features';
export const DOTCOM_STAGING_SITE = 'dotcom-staging-site';
export const DOTCOM_SITE_PERFORMANCE = 'dotcom-site-performance';

export const OVERVIEW = 'overview';

export const MARKETING_TOOLS = 'marketing-tools';
export const MARKETING_CONNECTIONS = 'marketing-connections';
export const MARKETING_TRAFFIC = 'marketing-traffic';
export const MARKETING_SHARING = 'marketing-sharing';

export const SETTINGS_SITE = 'settings-site';
export const SETTINGS_ADMINISTRATION = 'settings-administration';
export const SETTINGS_ADMINISTRATION_RESET_SITE = 'settings-administration-reset-site';
export const SETTINGS_ADMINISTRATION_TRANSFER_SITE = 'settings-administration-transfer-site';
export const SETTINGS_ADMINISTRATION_DELETE_SITE = 'settings-administration-delete-site';
export const SETTINGS_SERVER = 'settings-server';
export const SETTINGS_SFTP_SSH = 'settings-sftp-ssh';
export const SETTINGS_DATABASE = 'settings-database';
export const SETTINGS_PERFORMANCE = 'settings-performance';

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
	[ OVERVIEW ]: 'sites/overview/:site',
	[ MARKETING_TOOLS ]: 'sites/marketing/tools/:site',
	[ MARKETING_CONNECTIONS ]: 'sites/marketing/connections/:site',
	[ MARKETING_TRAFFIC ]: 'sites/marketing/traffic/:site',
	[ MARKETING_SHARING ]: 'sites/marketing/sharing-buttons/:site',
	[ SETTINGS_SITE ]: 'sites/settings/site/:site',
	[ SETTINGS_ADMINISTRATION_RESET_SITE ]: 'sites/settings/site/:site/reset-site',
	[ SETTINGS_ADMINISTRATION_TRANSFER_SITE ]: 'sites/settings/site/:site/transfer-site',
	[ SETTINGS_ADMINISTRATION_DELETE_SITE ]: 'sites/settings/site/:site/delete-site',
	[ SETTINGS_SERVER ]: 'sites/settings/server/:site',
	[ SETTINGS_SFTP_SSH ]: 'sites/settings/sftp-ssh/:site',
	[ SETTINGS_DATABASE ]: 'sites/settings/database/:site',
	[ SETTINGS_PERFORMANCE ]: 'sites/settings/performance/:site',
};
