/**
 * Console dispatcher Redux store enhancer
 *
 * Inject into the `createStore` enhancer chain in order
 * to provide access to the store directly from the console.
 *
 * Will only attach if the `window` variable is available
 * globally. If not it will simply be an empty link in the
 * chain, passing straight through.
 *
 * A few helpers have also been attached to the window in
 * order to make debugging and interacting easier. Please
 * see the README for more information.
 *
 */

/**
 * External dependencies
 */
import { matchesProperty } from 'lodash';

/**
 * Internal dependencies
 */
import * as actionTypes from 'state/action-types';

const state = {
	actionHistory: [],
	shouldRecordActions: true,
	historySize: 100,
};

const actionLog = {
	clear: () => state.actionHistory = [],
	filter: type => state.actionHistory.filter( matchesProperty( 'type', type ) ),
	setSize: size => state.historySize = size,
	start: () => state.shouldRecordActions = true,
	stop: () => state.shouldRecordActions = false,
};

Object.defineProperty( actionLog, 'history', {
	enumerable: true,
	get: () => state.actionHistory,
} );

const recordAction = action => {
	const {
		actionHistory,
		historySize,
	} = state;

	const thunkDescription = 'function' === typeof action
		? { type: 'thunk (hidden)' }
		: {};

	actionHistory.push( {
		...action,
		...thunkDescription,
		meta: {
			...action.meta,
			timestamp: Date.now(),
		},
	} );

	// cheap optimization to keep from
	// thrashing once we hit our size limit
	if ( actionHistory.length > ( 2 * historySize ) ) {
		state.actionHistory = actionHistory.slice( -1 * historySize );
	}
};

export const consoleDispatcher = next => ( reducer, initialState ) => {
	const store = next( reducer, initialState );

	if ( 'undefined' === typeof window ) {
		return store;
	}

	const dispatch = action => {
		if ( state.shouldRecordActions ) {
			recordAction( action );
		}

		return store.dispatch( action );
	};

	Object.assign( window, store, {
		actionLog,
		actionTypes,
		dispatch,
	} );

	Object.defineProperty( window, 'state', {
		enumerable: true,
		get: () => store.getState(),
	} );

	return {
		...store,
		dispatch
	};
};

export default consoleDispatcher;
