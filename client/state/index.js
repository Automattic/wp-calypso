/** @format */
/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';

/**
 * Internal dependencies
 */
import initialReducer from './reducer';

/**
 * Store enhancers
 */
import actionLogger from './action-log';
import consoleDispatcher from './console-dispatch';
import { enhancer as httpDataEnhancer } from 'state/data-layer/http-data';

/**
 * Redux middleware
 */
import navigationMiddleware from './navigation/middleware';
import noticesMiddleware from './notices/middleware';
import wpcomApiMiddleware from 'state/data-layer/wpcom-api-middleware';

const addReducerEnhancer = nextCreator => ( reducer, initialState ) => {
	const nextStore = nextCreator( reducer, initialState );

	let currentReducer = reducer;
	function addReducer( keys, subReducer ) {
		currentReducer = currentReducer.addReducer( keys, subReducer );
		this.replaceReducer( currentReducer );
	}

	function getCurrentReducer() {
		return currentReducer;
	}

	return Object.assign( {}, nextStore, { addReducer, getCurrentReducer } );
};

/**
 * @typedef {Object} ReduxStore
 * @property {!Function} dispatch dispatches actions
 * @property {!Function} getState returns the current state tree
 * @property {Function} replaceReducers replaces the state reducers
 * @property {Function} subscribe attaches an event listener to state changes
 */

export function createReduxStore( initialState, reducer = initialReducer ) {
	const isBrowser = typeof window === 'object';
	const isAudioSupported = typeof window === 'object' && typeof window.Audio === 'function';

	const middlewares = [
		thunkMiddleware,
		// We need the data layer middleware to be used as early
		// as possible, before any side effects.
		// The data layer dispatches actions on network events
		// including success, failure, and progress updates
		// Its way of issuing these is to wrap the originating action
		// with special meta and dispatch it again each time.
		// If another middleware jumps in before the data layer
		// then it could mistakenly trigger on those network
		// responses. Therefore we need to inject the data layer
		// as early as possible into the middleware chain.
		wpcomApiMiddleware,
		noticesMiddleware,
		isBrowser && require( './happychat/middleware.js' ).default,
		isBrowser && require( './happychat/middleware-calypso.js' ).default,
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './lib/middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
		navigationMiddleware,
	].filter( Boolean );

	const enhancers = [
		addReducerEnhancer,
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		httpDataEnhancer,
		applyMiddleware( ...middlewares ),
		isBrowser && window.app && window.app.isDebug && actionLogger,
		isBrowser && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	].filter( Boolean );

	return createStore( reducer, initialState, compose( ...enhancers ) );
}
