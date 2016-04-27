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

export function createReducer( initialState = null, handlers = {}, schema = null ) {
	const defaultHandlers = {
		[SERIALIZE]: ( state ) => {
			if ( schema !== null ) {
				return state;
			}

			return initialState;
		},
		[DESERIALIZE]: ( state ) => {
			if ( schema !== null && isValidStateWithSchema( state, schema ) ) {
				return state;
			}

			return initialState;
		}
	};

	handlers = Object.assign( {}, defaultHandlers, handlers );

	return ( state = initialState, action ) => {
		const { type } = action;

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};
}
