/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withoutPersistence } from './without-persistence';
import { createBaseReducer } from './create-base-reducer';

/**
 * Returns a reducer function with state calculation determined by the result
 * of invoking the handler key corresponding with the dispatched action type,
 * passing both the current state and action object.
 *
 * @param  {*}        initialState   Initial state
 * @param  {Object}   handlers       Object mapping action types to state action handlers
 * @return {Function}                Reducer function
 */
export function createReducer( initialState, handlers, ...args ) {
	if ( args && args.length > 0 ) {
		throw new Error(
			'Schema support in createReducer is no longer available. Please use createReducerWithValidation instead.'
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
