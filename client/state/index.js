/** @format */

/**
 * External dependencies
 */

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
// import the reducer directly from a submodule to prevent bundling the whole Redux Form
// library into the `build` chunk.
// TODO: change this back to `from 'redux-form'` after upgrade to Webpack 4.0 and a version
//       of Redux Form that uses the `sideEffects: false` flag
import form from 'redux-form/es/reducer';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import application from './application/reducer';
import comments from './comments/reducer';
import currentUser from './current-user/reducer';
import documentHead from './document-head/reducer';
import preferences from './preferences/reducer';
import reader from './reader/reducer';
import posts from './posts/reducer';
import ui from './ui/reducer';
import users from './users/reducer';
import config from 'config';

/**
 * Module variables
 */

const reducers = {
	application,
	comments,
	currentUser,
	documentHead,
	form,
	preferences,
	reader,
	posts,
	ui,
	users,
};

export const reducer = combineReducers( reducers );

/**
 * @typedef {Object} ReduxStore
 * @property {!Function} dispatch dispatches actions
 * @property {!Function} getState returns the current state tree
 * @property {Function} replaceReducers replaces the state reducers
 * @property {Function} subscribe attaches an event listener to state changes
 */

export function createReduxStore( initialState = {} ) {
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
		require( './data-layer/wpcom-api-middleware.js' ).default,
		isBrowser && require( './lib/middleware.js' ).default,
		isBrowser &&
			config.isEnabled( 'restore-last-location' ) &&
			require( './routing/middleware.js' ).default,
		isAudioSupported && require( './audio/middleware.js' ).default,
		isBrowser && require( './comments/middleware.js' ).default,
	].filter( Boolean );

	const enhancers = [
		applyMiddleware( ...middlewares ),
		isBrowser && window.devToolsExtension && window.devToolsExtension(),
	].filter( Boolean );

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
