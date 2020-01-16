/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { AppState } from 'types';

export function getVariationForUser( state: AppState, experiment: string ) {
	return get( state, [ 'experiments', 'tests', experiment ], null );
}

export const isLoading = ( state: AppState ) => {
	return get( state, [ 'experiments', 'isLoading' ], true );
};

export const getAnonId = ( state: AppState ) => {
	return get( state, [ 'experiments', 'anonId' ], null );
};

export const nextRefresh = ( state: AppState ) => {
	return get( state, [ 'experiments', 'nextRefresh' ], Date.now() );
};
