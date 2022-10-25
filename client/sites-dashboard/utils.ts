import { SiteExcerptNetworkData } from 'calypso/data/sites/site-excerpt-types';

export const getLaunchpadUrl = ( slug: string, flow: string ) => {
	return `/setup/launchpad?flow=${ flow }&siteSlug=${ slug }`;
};

export const getDashboardUrl = ( slug: string ) => {
	return `/home/${ slug }`;
};

export const getSettingsUrl = ( slug: string ) => {
	return `/settings/general/${ slug }`;
};

export const getPluginsUrl = ( slug: string ) => {
	return `/plugins/${ slug }`;
};

export const getManagePluginsUrl = ( slug: string ) => {
	return `/plugins/manage/${ slug }`;
};

export const getHostingConfigUrl = ( slug: string ) => {
	return `/hosting-config/${ slug }`;
};

export const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

export const isNotAtomicJetpack = ( site: SiteExcerptNetworkData ) => {
	return site.jetpack && ! site?.is_wpcom_atomic;
};

export const SMALL_MEDIA_QUERY = 'screen and ( max-width: 600px )';

export const MEDIA_QUERIES = {
	small: `@media ${ SMALL_MEDIA_QUERY }`,
	mediumOrSmaller: '@media screen and ( max-width: 781px )',
	mediumOrLarger: '@media screen and ( min-width: 660px )',
	large: '@media screen and ( min-width: 960px )',
	wide: '@media screen and ( min-width: 1280px )',
};

export const PLAN_RENEW_NAG_EVENT_NAMES = {
	IN_VIEW: 'calypso_sites_dashboard_plan_renew_nag_inview',
	ON_CLICK: 'calypso_sites_dashboard_plan_renew_nag_click',
};
