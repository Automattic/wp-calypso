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
 * resolver that uses the `domain` parameter. The parameter is included here
 * even though it is not used, to ensure consuming code doesn't error out.
 *
 * @param state {State}		state object
 * @param _domain {string}	unused variable, exists here only to match the resolver
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getExistingSite = ( state: State, _domain: string ) => {
	return state.existingSite;
};
