/**
 * External dependencies
 */
import { isEqual, omit } from 'lodash';
import { Reducer, AnyAction } from 'redux';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'calypso/state/action-types';
import { Query, QueryState } from 'calypso/state/route/types';

const timestamped = ( query: Query ): Query => ( {
	...query,
	_timestamp: Date.now(),
} );

const isEqualQuery = ( state: QueryState[ keyof QueryState ], query: Query ) =>
	isEqual( omit( state, '_timestamp' ), omit( query, '_timestamp' ) );

const initialReducer = ( state: QueryState[ 'initial' ], query: Query ) =>
	state === false ? timestamped( query ) : state;

const currentReducer = ( state: QueryState[ 'current' ], query: Query ) =>
	! isEqualQuery( state, query ) ? timestamped( query ) : state;

const initialState = {
	initial: false as const,
	current: false as const,
	previous: false as const,
};

export const queryReducer: Reducer< QueryState, AnyAction > = ( state = initialState, action ) => {
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
