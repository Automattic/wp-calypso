/**
 * External dependencies
 */

import { isEqual, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';

const timestamped = ( query ) => ( {
	...query,
	_timestamp: Date.now(),
} );

const isEqualQuery = ( a, b ) => isEqual( omit( a, '_timestamp' ), omit( b, '_timestamp' ) );

const initialReducer = ( state, query ) => ( state === false ? timestamped( query ) : state) ;
const currentReducer = ( state, query ) =>
	! isEqualQuery( state, query ) ? timestamped( query ) : state;

const initialState = {
	initial: false,
	current: false,
	previous: false,
};

export const queryReducer = ( state = initialState, action ) => {
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
