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
 * @param {function} reducer - Function with type `(state, action) -> state`.
 * @param {Object} [initialState] - Initial state whose type matches that of `reducer`.
 * @param {array<string>} [waitFor] - See Flux Dispatcher's `waitFor`.
 * @return {Object} Store built from reducer.
 */
export const createReducerStore = ( reducer, initialState = {}, waitFor = [] ) => {
	let state = initialState,
		ReducerStore = {};

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

/**
 * Combine multiple Flux stores into a single one.
 *
 * Given a dictionary of Flux stores (where keys are store names, and values
 * are store objects) and a namespace string, combine stores into a single store.
 *
 * Providing a `getState()` and a `dispatch()` method (the latter just invokes
 * our own Flux dispatcher), this emulates Redux's
 * [`createStore()`](http://rackt.org/redux/docs/api/createStore.html)
 * function, and is meant as a drop-in wrapper to help with migration to Redux,
 * especially of action creators.
 *
 * @example
 * const themesStore = combineStores( {
 *     themesList: themesListStore,
 *     currentTheme: currentThemeStore },
 * 'themes' } );
 * // ...
 * const queryParams = themesStore.getState().themes.themesList.get( 'query' );
 * @param {Object} stores - Dictionary of stores to combine.
 * @param {string} namespace - Namespace.
 * @return {Object} Combined store.
 */
export const combineStores = ( stores, namespace ) => ( {
	getState: () => ( {
		[ namespace ]: Object
			.keys( stores )
			.reduce( mergeStates( stores ), {} )
	} ),

	dispatch: ( action, source = 'VIEW_ACTION' ) => {
		Dispatcher.dispatch( { source, action } );
	}
} );

function mergeStates( stores ) {
	return ( total, store ) => Object.assign( total, { [ store ]: stores[ store ].get() } );
}
