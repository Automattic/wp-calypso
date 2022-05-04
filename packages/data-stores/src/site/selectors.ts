import { select } from '@wordpress/data';
import { STORE_KEY } from './constants';
import { SiteLaunchStatus } from './types';
import type { State } from './reducer';

export const getState = ( state: State ) => state;
export const getNewSite = ( state: State ) => state.newSite.data;
export const getNewSiteError = ( state: State ) => state.newSite.error;
export const isFetchingSite = ( state: State ) => state.newSite.isFetching;
export const isFetchingSiteDetails = ( state: State ) => state.isFetchingSiteDetails;
export const isNewSite = ( state: State ) => !! state.newSite.data;

/**
 * Get a site matched by id. This selector has a matching
 * resolver that uses the `siteId` parameter to fetch an existing site. If the
 * site cannot be found, invalidate the resolution cache.
 *
 * @param state {State}		state object
 * @param siteId {number}	id of the site to look up
 */
export const getSite = ( state: State, siteId: number | string ) => {
	return (
		state.sites[ siteId ] ||
		Object.values( state.sites ).find( ( site ) => site && new URL( site.URL ).host === siteId )
	);
};

export const getSiteIdBySlug = ( _: State, slug: string ) => {
	return select( STORE_KEY ).getSite( slug )?.ID;
};

export const getSiteTitle = ( _: State, siteId: number ) =>
	select( STORE_KEY ).getSite( siteId )?.name;

export const getSiteVerticalId = ( _: State, siteId: number ) =>
	select( STORE_KEY ).getSite( siteId )?.options?.site_vertical_id;

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunched = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.SUCCESS;
};

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunching = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.IN_PROGRESS;
};

export const isSiteAtomic = ( state: State, siteId: number | string ) => {
	return select( STORE_KEY ).getSite( siteId )?.options.is_wpcom_atomic === true;
};

export const isSiteWPForTeams = ( state: State, siteId: number | string ) => {
	return select( STORE_KEY ).getSite( siteId )?.options.is_wpforteams_site === true;
};

export const getSiteDomains = ( state: State, siteId: number ) => {
	return state.sitesDomains[ siteId ];
};

export const getSiteSettings = ( state: State, siteId: number ) => {
	return state.sitesSettings[ siteId ];
};

export const getSiteSetupError = ( state: State ) => {
	return state.siteSetupErrors;
};

export const getPrimarySiteDomain = ( _: State, siteId: number ) =>
	select( STORE_KEY )
		.getSiteDomains( siteId )
		?.find( ( domain ) => domain.primary_domain );

export const getSiteSubdomain = ( _: State, siteId: number ) =>
	select( STORE_KEY )
		.getSiteDomains( siteId )
		?.find( ( domain ) => domain.is_subdomain );

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

export const hasActiveSiteFeature = (
	_: State,
	siteId: number | undefined,
	featureKey: string
): boolean => {
	return Boolean(
		siteId && select( STORE_KEY ).getSite( siteId )?.plan?.features.active.includes( featureKey )
	);
};

export const hasAvailableSiteFeature = (
	_: State,
	siteId: number | undefined,
	featureKey: string
): boolean => {
	return Boolean(
		siteId && select( STORE_KEY ).getSite( siteId )?.plan?.features.available[ featureKey ]
	);
};

export const requiresUpgrade = ( state: State, siteId: number | null ) => {
	const isWoopFeatureActive = Boolean(
		siteId && select( STORE_KEY ).hasActiveSiteFeature( siteId, 'woop' )
	);
	const hasWoopFeatureAvailable = Boolean(
		siteId && select( STORE_KEY ).hasAvailableSiteFeature( siteId, 'woop' )
	);

	return Boolean( ! isWoopFeatureActive && hasWoopFeatureAvailable );
};

export function isJetpackSite( state: State, siteId?: number ): boolean {
	return Boolean( siteId && select( STORE_KEY ).getSite( siteId )?.jetpack );
}

export function isEligibleForProPlan( state: State, siteId?: number ): boolean {
	if ( ! siteId ) {
		return false;
	}

	if (
		( isJetpackSite( state, siteId ) && ! isSiteAtomic( state, siteId ) ) ||
		isSiteWPForTeams( state, siteId )
	) {
		return false;
	}

	return true;
}

export function getHappyChatAvailability( state: State ) {
	return state.happyChatAvailability;
}

export function getEmailSupportAvailability( state: State ) {
	return state.emailSupportAvailability;
}
