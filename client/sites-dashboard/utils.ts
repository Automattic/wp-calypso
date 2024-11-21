import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import type { SiteExcerptData, SiteExcerptNetworkData } from '@automattic/sites';

export const TRACK_SOURCE_NAME = 'sites-dashboard';

export const getLaunchpadUrl = ( slug: string, flow: string ) => {
	return `/setup/${ flow }/launchpad?siteSlug=${ slug }`;
};

export const getDashboardUrl = ( slug: string ) => {
	return `/home/${ slug }`;
};

export const getSettingsUrl = ( slug: string ) => {
	return `/settings/general/${ slug }`;
};

export const getSiteMonitoringUrl = ( slug: string ) => {
	return `/site-monitoring/${ slug }`;
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

export function isCustomDomain( siteSlug: string | null | undefined ): boolean {
	if ( ! siteSlug ) {
		return false;
	}
	return ! siteSlug.endsWith( '.wordpress.com' ) && ! siteSlug.endsWith( '.wpcomstaging.com' );
}

export function getSiteAdminUrl( site: SiteExcerptNetworkData ) {
	return site.options?.admin_url ?? '';
}

export const isNotAtomicJetpack = ( site: SiteExcerptNetworkData ) => {
	return site.jetpack && ! site?.is_wpcom_atomic;
};

// Sites connected through A4A plugin are listed on wordpress.com/sites even when Jetpack is deactivated.
export const isDisconnectedJetpackAndNotAtomic = ( site: SiteExcerptNetworkData ) => {
	return ! site?.is_wpcom_atomic && site?.jetpack_connection && ! site?.jetpack;
};

export const isSimpleSite = ( site: SiteExcerptNetworkData ) => {
	return ! site?.jetpack && ! site?.is_wpcom_atomic;
};

export const isP2Site = ( site: SiteExcerptNetworkData ) => {
	return site.options?.is_wpforteams_site;
};

export const isStagingSite = ( site: SiteExcerptNetworkData | undefined ) => {
	return site?.is_wpcom_staging_site;
};

export const isMigrationTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_MIGRATION_TRIAL_MONTHLY;
};

export const isMigrationInProgress = ( site: SiteExcerptData ): boolean => {
	const migrationStatus = site?.site_migration?.migration_status;
	if ( ! migrationStatus ) {
		return false;
	}

	return ! migrationStatus.startsWith( 'migration-completed' );
};

export const getMigrationStatus = (
	site: SiteExcerptData
): 'pending' | 'started' | 'completed' | undefined => {
	const migrationStatus = site?.site_migration?.migration_status;
	if ( ! migrationStatus ) {
		return undefined;
	}

	const status = migrationStatus.split( '-' )[ 1 ];

	if ( ! [ 'pending', 'started', 'completed' ].includes( status ) ) {
		return undefined;
	}

	return status as 'pending' | 'started' | 'completed';
};

export const getMigrationType = ( site: SiteExcerptData ): 'diy' | 'difm' | undefined => {
	const migrationStatus = site?.site_migration?.migration_status;
	if ( ! migrationStatus ) {
		return undefined;
	}

	const type = migrationStatus.split( '-' )[ 2 ];

	if ( ! [ 'difm', 'diy' ].includes( type ) ) {
		return undefined;
	}

	return type as 'diy' | 'difm';
};

export const isHostingTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_HOSTING_TRIAL_MONTHLY;
};

export const isECommerceTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
};

export const isBusinessTrialSite = ( site: SiteExcerptNetworkData ) => {
	return isMigrationTrialSite( site ) || isHostingTrialSite( site );
};

export const isTrialSite = ( site: SiteExcerptNetworkData ) => {
	return isBusinessTrialSite( site ) || isECommerceTrialSite( site );
};

export const getAdminInterface = ( site: SiteExcerptNetworkData ) => {
	return site?.options?.wpcom_admin_interface;
};

export const siteUsesWpAdminInterface = ( site: SiteExcerptNetworkData ) => {
	return ( site.jetpack && ! site.is_wpcom_atomic ) || getAdminInterface( site ) === 'wp-admin';
};

export interface InterfaceURLFragment {
	calypso: `/${ string }`;
	wpAdmin: `/${ string }`;
}

export const generateSiteInterfaceLink = (
	site: SiteExcerptData,
	urlFragment: InterfaceURLFragment
) => {
	const targetLink = siteUsesWpAdminInterface( site )
		? `${ site.URL }/wp-admin${ urlFragment.wpAdmin }`
		: `${ urlFragment.calypso }/${ site.slug }`;

	return targetLink;
};

export const SMALL_MEDIA_QUERY = 'screen and ( max-width: 600px )';

export const MEDIA_QUERIES = {
	small: `@media ${ SMALL_MEDIA_QUERY }`,
	mediumOrSmaller: '@media screen and ( max-width: 781px )',
	mediumOrLarger: '@media screen and ( min-width: 660px )',
	hideTableRows: '@media screen and ( max-width: 1100px )',
	large: '@media screen and ( min-width: 960px )',
	wide: '@media screen and ( min-width: 1280px )',
};

export const PLAN_RENEW_NAG_EVENT_NAMES = {
	IN_VIEW: 'calypso_sites_dashboard_plan_renew_nag_inview',
	ON_CLICK: 'calypso_sites_dashboard_plan_renew_nag_click',
};
