/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withoutPersistence } from './without-persistence';
import { createBaseReducer } from './create-base-reducer';

// eslint-disable-next-line valid-jsdoc
/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object.
 *
 * @deprecated Use a plain reducer function instead.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @return {Function}                Reducer function
 */
export function createReducer( initialState, handlers, __deprecatedArg__ ) {
	if ( __deprecatedArg__ !== undefined ) {
		throw new Error(
			'Schema support in createReducer is no longer available. ' +
				'Please use a plain reducer function wrapped with `withSchemaValidation`.'
		);
	}
	const reducer = createBaseReducer( initialState, handlers );

	if ( ! handlers[ SERIALIZE ] && ! handlers[ DESERIALIZE ] ) {
		return withoutPersistence( reducer );
	}

	// if the reducer has at least one custom persistence handler (SERIALIZE or DESERIALIZE)
	// it's treated as a reducer with custom persistence.
	reducer.hasCustomPersistence = true;
	return reducer;
}
