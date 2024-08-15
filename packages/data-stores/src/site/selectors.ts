import { select } from '@wordpress/data';
import { STORE_KEY } from './constants';
import { Domain, SiteLaunchStatus, SiteDetails, SiteOption, SiteSelect } from './types';
import type { State } from './reducer';

export const getState = ( state: State ) => state;
export const getNewSite = ( state: State ) => state.newSite.data;
export const getNewSiteError = ( state: State ) => state.newSite.error;
export const isFetchingSite = ( state: State ) => state.newSite.isFetching;
export const getFetchingSiteError = ( state: State ) => state.fetchingSiteError;
export const isFetchingSiteDetails = ( state: State ) => state.isFetchingSiteDetails;
export const isNewSite = ( state: State ) => !! state.newSite.data;

/**
 * Get a site matched by id. This selector has a matching
 * resolver that uses the `siteId` parameter to fetch an existing site. If the
 * site cannot be found, invalidate the resolution cache.
 * @param state {State}		state object
 * @param siteId {number}	id of the site to look up
 */
export const getSite: ( state: State, siteId: number | string ) => SiteDetails | undefined = (
	state,
	siteId
) => {
	return (
		// Try matching numeric site ID
		state.sites[ siteId ] ||
		// Then try matching primary domain
		Object.values( state.sites ).find( ( site ) => site?.URL && new URL( site.URL ).host === siteId ) ||
		// Then try matching second domain
		Object.values( state.sites ).find(
			( site ) =>
				site?.options?.unmapped_url && new URL( site.options.unmapped_url ).host === siteId
		)
	);
};

export const getSiteIdBySlug: ( _: State, slug: string ) => number | undefined = ( _, slug ) => {
	return ( select( STORE_KEY ) as SiteSelect ).getSite( slug )?.ID;
};

export const getSiteTitle: ( _: State, siteId: number ) => string | undefined = ( _, siteId ) =>
	( select( STORE_KEY ) as SiteSelect ).getSite( siteId )?.name;

export const getSiteVerticalId: ( _: State, siteId: number ) => string | null | undefined = (
	_,
	siteId
) => ( select( STORE_KEY ) as SiteSelect ).getSite( siteId )?.options?.site_vertical_id;

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunched = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.SUCCESS;
};

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunching = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.IN_PROGRESS;
};

export const isSiteAtomic: ( _: State, siteId: number | string ) => boolean = ( state, siteId ) => {
	return ( select( STORE_KEY ) as SiteSelect ).getSite( siteId )?.options?.is_wpcom_atomic === true;
};

export const isSiteWPForTeams: ( _: State, siteId: number | string ) => boolean = (
	state,
	siteId
) => {
	return (
		( select( STORE_KEY ) as SiteSelect ).getSite( siteId )?.options?.is_wpforteams_site === true
	);
};

export const getSiteDomains = ( state: State, siteId: number ) => {
	return state.sitesDomains[ siteId ];
};

export const getSiteSettings = ( state: State, siteId: number ) => {
	return state.sitesSettings[ siteId ];
};

export const getSiteTheme = ( state: State, siteId: number ) => {
	return state.siteTheme[ siteId ];
};

export const getSiteGlobalStyles = ( state: State, siteId: number ) => {
	return state.sitesGlobalStyles[ siteId ];
};

export const getSiteSetupError = ( state: State ) => {
	return state.siteSetupErrors;
};

export const getSiteOptions = ( state: State, siteId: number ) => {
	return state.sites[ siteId ]?.options;
};

export const getSiteOption = ( state: State, siteId: number, optionName: SiteOption ) => {
	return state.sites[ siteId ]?.options?.[ optionName ];
};

export const getPrimarySiteDomain: ( _: State, siteId: number ) => Domain | undefined = (
	_,
	siteId
) =>
	( select( STORE_KEY ) as SiteSelect )
		.getSiteDomains( siteId )
		?.find( ( domain: Domain ) => domain.primary_domain );

export const getSiteSubdomain: ( _: State, siteId: number ) => Domain | undefined = ( _, siteId ) =>
	( select( STORE_KEY ) as SiteSelect )
		.getSiteDomains( siteId )
		?.find( ( domain: Domain ) => domain.is_subdomain );

export const getSiteLatestAtomicTransfer = ( state: State, siteId: number ) => {
	return state.latestAtomicTransferStatus[ siteId ]?.transfer;
};

export const getSiteLatestAtomicTransferError = ( state: State, siteId: number ) => {
	return state.latestAtomicTransferStatus[ siteId ]?.errorCode;
};

export const getAtomicSoftwareStatus = ( state: State, siteId: number, softwareSet: string ) => {
	return state.atomicSoftwareStatus[ siteId ]?.[ softwareSet ]?.status;
};

export const getAtomicSoftwareError = ( state: State, siteId: number, softwareSet: string ) => {
	return state.atomicSoftwareStatus[ siteId ]?.[ softwareSet ]?.error;
};

export const getAtomicSoftwareInstallError = (
	state: State,
	siteId: number,
	softwareSet: string
) => {
	return state.atomicSoftwareInstallStatus[ siteId ]?.[ softwareSet ]?.error;
};

export const siteHasFeature = (
	_: State,
	siteId: number | undefined,
	featureKey: string
): boolean => {
	return Boolean(
		siteId &&
			( select( STORE_KEY ) as SiteSelect )
				.getSite( siteId )
				?.plan?.features.active.includes( featureKey )
	);
};

// TODO: The `0` here seems wrong and should likely be addressed.
export const requiresUpgrade: ( state: State, siteId: number | null ) => boolean | 0 | null = (
	state,
	siteId
) => {
	return siteId && ! ( select( STORE_KEY ) as SiteSelect ).siteHasFeature( siteId, 'woop' );
};

export function isJetpackSite( state: State, siteId?: number ): boolean {
	return Boolean( siteId && ( select( STORE_KEY ) as SiteSelect ).getSite( siteId )?.jetpack );
}

export const getBundledPluginSlug = ( state: State, siteSlug: string ) =>
	state.bundledPluginSlug[ siteSlug ];
