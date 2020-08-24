/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import emitter from 'lib/mixins/emitter';

/**
 * Create a traditional Flux store from a Redux-style (`(state, action)`)
 * reducer.
 *
 * @example
 * const counterReducer = ( state = 0, payload ) => {
 *   const { action } = payload;
 *   switch ( action.type ) {
 *     case INCREMENT_COUNTER:
 *     return state + 1;
 *   }
 *   return state;
 * };
 * const CounterStore = createReducerStore( counterReducer, 0 );
 * @param {Function} reducer - Function with type `(state, action) -> state`.
 * @param {object} [initialState] - Initial state whose type matches that of `reducer`.
 * @param {Array<string>} [waitFor] - See Flux Dispatcher's `waitFor`.
 * @returns {object} Store built from reducer.
 */
export const createReducerStore = ( reducer, initialState = {}, waitFor = [] ) => {
	let state = initialState;
	const ReducerStore = {};

	emitter( ReducerStore );

	ReducerStore.get = () => state;

	ReducerStore.dispatchToken = Dispatcher.register( ( payload ) => {
		Dispatcher.waitFor( waitFor );

		const newState = reducer( state, payload );

		if ( newState !== state ) {
			state = newState;
			ReducerStore.emitChange();
		}
	} );

	return ReducerStore;
};
