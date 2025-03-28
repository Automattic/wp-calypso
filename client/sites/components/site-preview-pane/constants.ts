export const OVERVIEW = 'overview';
export const MONITORING = 'monitoring';
export const LOGS_PHP = 'logs-php';
export const LOGS_WEB = 'logs-web';
export const DEPLOYMENTS = 'deployments';
export const HOSTING_CONFIG = 'hosting-config';
export const HOSTING_FEATURES = 'hosting-features';
export const STAGING_SITE = 'staging-site';
export const PERFORMANCE = 'performance';
export const SETTINGS_SITE = 'settings-site';
export const SETTINGS_ADMINISTRATION_RESET_SITE = 'settings-administration-reset-site';
export const SETTINGS_ADMINISTRATION_TRANSFER_SITE = 'settings-administration-transfer-site';
export const SETTINGS_ADMINISTRATION_DELETE_SITE = 'settings-administration-delete-site';
export const SETTINGS_SERVER = 'settings-server';
export const SETTINGS_SFTP_SSH = 'settings-sftp-ssh';
export const SETTINGS_DATABASE = 'settings-database';
export const SETTINGS_PERFORMANCE = 'settings-performance';
export const PLAN = 'plan';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ OVERVIEW ]: 'overview/:site',
	[ MONITORING ]: 'site-monitoring/:site',
	[ LOGS_PHP ]: 'site-logs/:site/php',
	[ LOGS_WEB ]: 'site-logs/:site/web',
	[ DEPLOYMENTS ]: 'github-deployments/:site',
	[ HOSTING_CONFIG ]: 'hosting-config/:site',
	[ HOSTING_FEATURES ]: 'hosting-features/:site',
	[ STAGING_SITE ]: 'staging-site/:site',
	[ PERFORMANCE ]: 'sites/performance/:site',
	[ SETTINGS_SITE ]: 'sites/settings/site/:site',
	[ SETTINGS_ADMINISTRATION_RESET_SITE ]: 'sites/settings/site/:site/reset-site',
	[ SETTINGS_ADMINISTRATION_TRANSFER_SITE ]: 'sites/settings/site/:site/transfer-site',
	[ SETTINGS_ADMINISTRATION_DELETE_SITE ]: 'sites/settings/site/:site/delete-site',
	[ SETTINGS_SERVER ]: 'sites/settings/server/:site',
	[ SETTINGS_SFTP_SSH ]: 'sites/settings/sftp-ssh/:site',
	[ SETTINGS_DATABASE ]: 'sites/settings/database/:site',
	[ SETTINGS_PERFORMANCE ]: 'sites/settings/performance/:site',
	[ PLAN ]: 'plans/:site',
};
