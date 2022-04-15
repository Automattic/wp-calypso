import { combineReducers } from '@wordpress/data';
import { State } from './types';
import type { Action } from './actions';
import type { Reducer } from 'redux';

export const transferEligibility: Reducer< State, Action > = ( state = {}, action ) => {
	switch ( action.type ) {
		case 'TRANSFER_ELIGIBILITY_RECEIVE': {
			return {
				...state,
				[ action.siteId ]: action.transferEligibility,
			};
		}
	}

	return state;
};

const reducer = combineReducers( {
	transferEligibility,
} );

export type RootState = ReturnType< typeof reducer >;

export default reducer;
