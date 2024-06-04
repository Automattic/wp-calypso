export const DOTCOM_OVERVIEW = 'dotcom-hosting';
export const DOTCOM_MONITORING = 'dotcom-site-monitoring';
export const DOTCOM_LOGS = 'dotcom-site-logs';
export const DOTCOM_GITHUB_DEPLOYMENTS = 'dotcom-github-deployments';
export const DOTCOM_HOSTING_CONFIG = 'dotcom-hosting-config';
export const DOTCOM_DEVELOPER_TOOLS = 'dotcom-developer-tools';
export const DOTCOM_STAGING_SITE = 'dotcom-staging-site';

export const FEATURE_TO_ROUTE_MAP: { [ feature: string ]: string } = {
	[ DOTCOM_OVERVIEW ]: 'overview/:site',
	[ DOTCOM_MONITORING ]: 'site-monitoring/:site',
	[ DOTCOM_LOGS ]: 'site-logs/:site',
	[ DOTCOM_GITHUB_DEPLOYMENTS ]: 'github-deployments/:site',
	[ DOTCOM_HOSTING_CONFIG ]: 'hosting-config/:site',
	[ DOTCOM_DEVELOPER_TOOLS ]: 'dev-tools/:site',
	[ DOTCOM_STAGING_SITE ]: 'staging-site/:site',
};
