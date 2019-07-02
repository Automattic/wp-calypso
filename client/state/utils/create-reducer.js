/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withoutPersistence } from './without-persistence';
import { withSchemaValidation } from './schema-utils';

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization validation
 * @return {Function}                Reducer function
 */
export function createReducer( initialState, handlers, schema ) {
	const reducer = ( state = initialState, action ) => {
		const { type } = action;

		if ( 'production' !== process.env.NODE_ENV && 'type' in action && ! type ) {
			throw new TypeError(
				'Reducer called with undefined type.' +
					' Verify that the action type is defined in state/action-types.js'
			);
		}

		if ( handlers.hasOwnProperty( type ) ) {
			return handlers[ type ]( state, action );
		}

		return state;
	};

	if ( schema ) {
		return withSchemaValidation( schema, reducer );
	}

	if ( ! handlers[ SERIALIZE ] && ! handlers[ DESERIALIZE ] ) {
		return withoutPersistence( reducer );
	}

	// if the reducer has at least one custom persistence handler (SERIALIZE or DESERIALIZE)
	// it's treated as a reducer with custom persistence.
	reducer.hasCustomPersistence = true;
	return reducer;
}
