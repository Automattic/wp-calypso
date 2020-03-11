/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

export const getNewSite = ( state: State ) => state.newSite.data;
export const getNewSiteError = ( state: State ) => state.newSite.error;
export const isFetchingSite = ( state: State ) => state.newSite.isFetching;
export const isNewSite = ( state: State ) => !! state.newSite.data;

/**
 * Get an existing site matched by domain string. This selector has a matching
 * resolver that uses the `slug` parameter to fetch an existing site.
 *
 * @param state {State}		state object
 * @param slug {string}		domain string
 */
export const getSite = ( state: State, slug: string ) => {
	return state.existingSite[ slug ];
};
