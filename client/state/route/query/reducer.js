import { isEmpty } from 'lodash';
import { ROUTE_SET } from 'calypso/state/action-types';

const initialState = {
	initial: null,
	current: null,
	previous: null,
};

export const queryReducer = ( state = initialState, action ) => {
	const query = isEmpty( action.query ) ? null : action.query;
	switch ( action.type ) {
		case ROUTE_SET:
			return {
				initial: state.initial ?? query,
				current: query,
				previous: state.current,
			};
	}

	return state;
};

export default queryReducer;
