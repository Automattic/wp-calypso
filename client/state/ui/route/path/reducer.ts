/**
 * Internal dependencies
 */
import { RouteSetAction } from 'state/ui/actions';
import { ROUTE_SET } from 'state/action-types';

interface State {
	initial: string;
	current: string;
	previous: string;
}

const initialState = {
	initial: '',
	current: '',
	previous: '',
};

export const pathReducer = ( state: State = initialState, action: RouteSetAction ) => {
	const { path, type } = action;
	switch ( type ) {
		case ROUTE_SET:
			return {
				initial: state.initial === '' ? path : state.initial,
				current: path,
				previous: state.current === '' ? '' : state.current,
			};
	}
	return state;
};

export default pathReducer;
