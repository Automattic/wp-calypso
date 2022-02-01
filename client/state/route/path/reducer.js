import { ROUTE_SET } from 'calypso/state/action-types';

const initialState = {
	initial: '',
	current: '',
	previous: '',
};

export const pathReducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case ROUTE_SET:
			return {
				initial: state.initial === '' ? action.path : state.initial,
				current: action.path,
				previous: state.current,
			};
	}
	return state;
};

export default pathReducer;
