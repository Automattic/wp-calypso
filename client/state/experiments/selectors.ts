/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { AppState } from 'types';

/**
 * Returns the user's assigned variation for a given experiment
 *
 * @param state The application state
 * @param experiment The name of the experiment
 */
export const getVariationForUser = ( state: AppState, experiment: string ) =>
	get( state, [ 'experiments', 'variations', experiment ], null );

/**
 * Returns true if the variations are loading for the current user
 *
 * @param state The application state
 */
export const isLoading = ( state: AppState ) => get( state, [ 'experiments', 'isLoading' ], true );

/**
 * Gets the anon id for the user, if set
 *
 * @param state The application state
 */
export const getAnonId = ( state: AppState ) => get( state, [ 'experiments', 'anonId' ], null );

/**
 * Get the time for the next variation refresh
 *
 * @param state The application state
 */
export const nextRefresh = ( state: AppState ) =>
	get( state, [ 'experiments', 'nextRefresh' ], Date.now() );
