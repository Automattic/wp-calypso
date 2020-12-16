/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { STORE_KEY } from './constants';
import { SiteLaunchStatus } from './types';

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
export const getSite = ( state: State, siteId: number ) => {
	return state.sites[ siteId ];
};

export const getSiteTitle = ( _: State, siteId: number ) =>
	select( STORE_KEY ).getSite( siteId )?.name;

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunched = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.SUCCESS;
};

// @TODO: Return LaunchStatus instead of a boolean
export const isSiteLaunching = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ]?.status === SiteLaunchStatus.IDLE;
};

export const getSiteDomains = ( state: State, siteId: number ) => {
	return state.sitesDomains[ siteId ];
};

export const getPrimarySiteDomain = ( _: State, siteId: number ) =>
	select( STORE_KEY )
		.getSiteDomains( siteId )
		?.find( ( domain ) => domain.primary_domain );

export const getSiteSubdomain = ( _: State, siteId: number ) =>
	select( STORE_KEY )
		.getSiteDomains( siteId )
		?.find( ( domain ) => domain.is_subdomain );
