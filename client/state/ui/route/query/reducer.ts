/**
 * External dependencies
 */
import { isEqual, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { RouteSetAction } from 'state/ui/actions';

const timestamped = query => ( {
	...query,
	_timestamp: Date.now(),
} );

const isEqualQuery = ( a, b ) => isEqual( omit( a, '_timestamp' ), omit( b, '_timestamp' ) );

const initialReducer = ( state: State['initial'], query: RouteSetAction['query'] ) =>
	state === false ? timestamped( query ) : state;
const currentReducer = ( state: State['current'], query: RouteSetAction['query'] ) =>
	! isEqualQuery( state, query ) ? timestamped( query ) : state;

interface State {
	initial: false | RouteSetAction['query'];
	current: false | RouteSetAction['query'];
	previous: false | RouteSetAction['query'];
}

const initialState: State = {
	initial: false,
	current: false,
	previous: false,
};

export const queryReducer = ( state: State = initialState, action: RouteSetAction ): State => {
	const { query, type } = action;
	switch ( type ) {
		case ROUTE_SET:
			return {
				initial: initialReducer( state.initial, query ),
				current: currentReducer( state.current, query ),
				previous: state.current === false ? false : state.current,
			};
	}
	return state;
};

export default queryReducer;
