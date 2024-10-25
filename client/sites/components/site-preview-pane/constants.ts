export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_LOGS_PHP = 'dotcom-site-logs-php';
export const DOTCOM_LOGS_WEB = 'dotcom-site-logs-web';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_HOSTING_FEATURES = 'dotcom-hosting-features';
export const DOTCOM_STAGING_SITE = 'dotcom-staging-site';
export const DOTCOM_SITE_PERFORMANCE = 'dotcom-site-performance';

export const SITE_OVERVIEW = 'site-overview';

export const SITE_PERFORMANCE = 'site-performance';

export const SITE_TOOLS_STAGING_SITE = 'site-tools-staging-site';
export const SITE_TOOLS_DEPLOYMENTS = 'site-tools-deployments';
export const SITE_TOOLS_MONITORING = 'site-tools-monitoring';
export const SITE_TOOLS_LOGS = 'site-tools-logs';
export const SITE_TOOLS_SFTP_SSH = 'site-tools-sftp-ssh';
export const SITE_TOOLS_DATABASE = 'site-tools-database';

export const SITE_MARKETING_TOOLS = 'site-marketing-tools';
export const SITE_MARKETING_BUSINESS_TOOLS = 'site-marketing-business-tools';
export const SITE_MARKETING_CONNECTIONS = 'site-marketing-connections';
export const SITE_MARKETING_TRAFFIC = 'site-marketing-traffic';
export const SITE_MARKETING_SHARING_BUTTONS = 'site-marketing-sharing-buttons';

export const SITE_SETTINGS_SITE = 'site-settings-site';
export const SITE_SETTINGS_WEB_SERVER = 'site-settings-web-server';
export const SITE_SETTINGS_CACHES = 'site-settings-caches';
export const SITE_SETTINGS_ADMINISTRATION = 'site-settings-administration';
export const SITE_SETTINGS_AGENCY = 'site-settings-agency';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ SITE_OVERVIEW ]: 'sites/overview/:site',
	[ SITE_PERFORMANCE ]: 'sites/performance/:site',
	[ SITE_TOOLS_STAGING_SITE ]: 'sites/tools/staging-site/:site',
	[ SITE_TOOLS_DEPLOYMENTS ]: 'sites/tools/deployments/:site',
	[ SITE_TOOLS_MONITORING ]: 'sites/tools/monitoring/:site',
	[ SITE_TOOLS_LOGS ]: 'sites/tools/logs/:site',
	[ SITE_TOOLS_SFTP_SSH ]: 'sites/tools/sft-ssh/:site',
	[ SITE_TOOLS_DATABASE ]: 'sites/tools/database/:site',
	[ SITE_MARKETING_TOOLS ]: 'sites/marketing/tools/:site',
	[ SITE_MARKETING_BUSINESS_TOOLS ]: 'sites/marketing/business-tools/:site',
	[ SITE_MARKETING_CONNECTIONS ]: 'sites/marketing/connections/:site',
	[ SITE_MARKETING_TRAFFIC ]: 'sites/marketing/traffic/:site',
	[ SITE_MARKETING_SHARING_BUTTONS ]: 'sites/marketing/sharing-buttons/:site',
	[ SITE_SETTINGS_SITE ]: 'sites/settings/site/:site',
	[ SITE_SETTINGS_WEB_SERVER ]: 'sites/settings/web-server/:site',
	[ SITE_SETTINGS_CACHES ]: 'sites/settings/caches/:site',
	[ SITE_SETTINGS_ADMINISTRATION ]: 'sites/settings/administration/:site',
	[ SITE_SETTINGS_AGENCY ]: 'sites/settings/agency/:site',
};
