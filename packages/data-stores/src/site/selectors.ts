/**
 * Internal dependencies
 */
import { State } from './reducer';
import { dispatch } from '@wordpress/data';
import { STORE_KEY } from './constants';

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
	const site = state.sites[ siteId ];
	if ( ! site ) {
		dispatch( 'core/data' ).invalidateResolution( STORE_KEY, 'getSite', [ siteId ] );
	}
	return site;
};
