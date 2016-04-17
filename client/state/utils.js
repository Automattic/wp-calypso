/**
 * External dependencies
 */
import tv4 from 'tv4';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	SERIALIZE,
} from './action-types';
import warn from 'lib/warn';

/**
 * Module variables
 */

export function isValidStateWithSchema( state, schema, checkForCycles = false, banUnknownProperties = false ) {
	const result = tv4.validateResult( state, schema, checkForCycles, banUnknownProperties );
	if ( ! result.valid ) {
		warn( 'state validation failed', state, result.error );
	}
	return result.valid;
}

export function createReducer( actionReducers, defaultState = null, schema = null ) {
	const defaultActionReducers = {
		[SERIALIZE]: ( state ) => {
			if ( schema !== null ) {
				return state;
			}

			return defaultState;
		},
		[DESERIALIZE]: ( state ) => {
			if ( schema !== null && isValidStateWithSchema( state, schema ) ) {
				return state;
			}

			return defaultState;
		}
	};

	actionReducers = Object.assign( {}, defaultActionReducers, actionReducers );

	return ( state = defaultState, action ) => {
		const { type } = action;

		if ( actionReducers[ type ] ) {
			return actionReducers[ type ]( state, action );
		}

		return state;
	};
}
