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
 * Get an existing site matched by domain string. This selector has a matching
 * resolver that uses the `slug` parameter to fetch an existing site. If the
 * existingSite cannot be found, invalidate the resolution cache.
 *
 * @param state {State}		state object
 * @param slug {string}		domain string
 */
export const getSite = ( state: State, slug: string ) => {
	const existingSite = state.existingSite[ slug ];
	if ( ! existingSite ) {
		dispatch( STORE_KEY ).invalidateResolution( 'getSite', [ slug ] );
	}
	return existingSite;
};
