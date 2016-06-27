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

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   customHandlers Object mapping action types to state
 *                                   action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization
 *                                   validation
 * @return {Function}                Reducer function
 */
export function createReducer( initialState = null, customHandlers = {}, schema = null ) {
	// Define default handlers for serialization actions. If no schema is
	// provided, always return the initial state. Otherwise, allow for
	// serialization and validate on deserialize.
	let defaultHandlers;
	if ( schema ) {
		defaultHandlers = {
			[ SERIALIZE ]: ( state ) => state,
			[ DESERIALIZE ]: ( state ) => {
				if ( isValidStateWithSchema( state, schema ) ) {
					return state;
				}

				return initialState;
			}
		};
	} else {
		defaultHandlers = {
			[ SERIALIZE ]: () => initialState,
			[ DESERIALIZE ]: () => initialState
		};
	}

	const handlers = {
		...defaultHandlers,
		...customHandlers
	};

	// When custom serialization behavior is provided, we assume that it may
	// involve heavy logic (mapping, converting from Immutable instance), so
	// we cache the result and only regenerate when state has changed.
	if ( customHandlers[ SERIALIZE ] ) {
		let lastState, lastSerialized;
		handlers[ SERIALIZE ] = ( state, action ) => {
			if ( state === lastState ) {
				return lastSerialized;
			}

			const serialized = customHandlers[ SERIALIZE ]( state, action );
			lastState = state;
			lastSerialized = serialized;
			return serialized;
		};
	}

	return ( state = initialState, action ) => {
		const { type } = action;

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};
}
