import { ROUTE_SET } from 'calypso/state/action-types';

const initialState = {
	initial: false,
	current: false,
	previous: false,
};

export const queryReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case ROUTE_SET:
			return {
				initial: state.initial === false ? action.query : state.initial,
				current: action.query,
				previous: state.current,
			};
	}

	return state;
};

export default queryReducer;
