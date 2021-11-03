import { ROUTE_SET } from 'calypso/state/action-types';

const initialState = {
	initial: null,
	current: null,
	previous: null,
};

export const queryReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case ROUTE_SET:
			return {
				initial: state.initial ?? action.query,
				current: action.query,
				previous: state.current,
			};
	}

	return state;
};

export default queryReducer;
