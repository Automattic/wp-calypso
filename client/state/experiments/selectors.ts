/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal Dependencies
 */
import { AppState } from 'types';

export function getVariationForUser( state: AppState, experiment: string ) {
	return get( state, [ 'experiments', 'Abtests', experiment ], null );
}

export const isLoading = ( state: AppState ) => {
	return get( state, [ 'experiments', 'Abtests' ], null ) === null;
};

export const getAnonId = ( state: AppState ) => {
	return get( state, [ 'experiments', 'anonId' ], null );
};

export const nextRefresh = ( state: AppState ) => {
	return get( state, [ 'experiments', 'nextRefresh' ], Date.now() );
};
