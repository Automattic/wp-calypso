/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const getState = ( state: State ) => state;

export const getNewSite = ( state: State ) => state.newSite.data;
export const getNewSiteError = ( state: State ) => state.newSite.error;
export const isFetchingSite = ( state: State ) => state.newSite.isFetching;
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

export const getSiteTitle = ( state: State, siteId: number ) => getSite( state, siteId )?.name;

export const isLaunched = ( state: State, siteId: number ) => {
	return state.launchStatus[ siteId ];
};
