/**
 * External dependencies
 */
import { flowRight } from 'lodash';
import EquivalentKeyMap from 'equivalent-key-map';

/**
 * Internal dependencies
 */
import { onSubKey } from './utils';

/**
 * Reducer function returning next state for selector resolution, object form:
 *
 *  reducerKey -> selectorName -> EquivalentKeyMap<Array,boolean>
 *
 * @param {Object} state  Current state.
 * @param {Object} action Dispatched action.
 *
 * @returns {Object} Next state.
 */
const isResolved = flowRight( [
	onSubKey( 'reducerKey' ),
	onSubKey( 'selectorName' ),
] )( ( state = new EquivalentKeyMap(), action ) => {
	switch ( action.type ) {
		case 'START_RESOLUTION':
		case 'FINISH_RESOLUTION':
			const isStarting = action.type === 'START_RESOLUTION';
			const nextState = new EquivalentKeyMap( state );
			nextState.set( action.args, isStarting );
			return nextState;
	}

	return state;
} );

export default isResolved;
