export const DOTCOM_OVERVIEW = 'dotcom-hosting';
export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_PHP_LOGS = 'dotcom-site-monitoring-php';
export const DOTCOM_SERVER_LOGS = 'dotcom-site-monitoring-web';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_DEVELOPER_TOOLS = 'dotcom-developer-tools';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOTCOM_OVERVIEW ]: 'overview/:site',
	[ DOTCOM_MONITORING ]: 'site-monitoring/:site',
	[ DOTCOM_PHP_LOGS ]: 'site-monitoring/:site/php',
	[ DOTCOM_SERVER_LOGS ]: 'site-monitoring/:site/web',
	[ DOTCOM_GITHUB_DEPLOYMENTS ]: 'github-deployments/:site',
	[ DOTCOM_HOSTING_CONFIG ]: 'hosting-config/:site',
	[ DOTCOM_DEVELOPER_TOOLS ]: 'dev-tools/:site',
};
