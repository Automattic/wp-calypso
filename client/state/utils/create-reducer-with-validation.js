/**
 * Internal dependencies
 */
import { withSchemaValidation } from './schema-utils';
import { createBaseReducer } from './create-base-reducer';

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object. Defines default
 * serialization (persistence) handlers based on the presence of a schema.
 *
 * @deprecated Use a plain reducer function wrapped with `withSchemaValidation` instead.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @param  {?Object}  schema         JSON schema object for deserialization validation
 * @return {Function}                Reducer function
 */
export function createReducerWithValidation( initialState, handlers, schema ) {
	if ( ! schema ) {
		throw new Error( 'Missing schema in call to createReducerWithValidation.' );
	}

	const reducer = createBaseReducer( initialState, handlers );
	return withSchemaValidation( schema, reducer );
}
