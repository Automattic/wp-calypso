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

export default transferEligibility;
