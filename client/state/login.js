/** @format */

/**
 * This is mostly copied over from 'state/index' to create a separate reducer
 * tree specially for login. Note, this is still a WIP/try to see how far we
 * can get pulling everything out from 'login' what isn't absolutely needed.
 */

/**
 * External dependencies
 */

import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { reducer as form } from 'redux-form';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import { enhancer as httpDataEnhancer, reducer as httpData } from 'state/data-layer/http-data';
import noticesMiddleware from './notices/middleware';
import login from './login/reducer';
import ui from './ui/reducer';
import notices from './notices/reducer';
import documentHead from './document-head/reducer';

const reducers = {
	form,
	login,
	httpData,
	ui,
	notices,
	documentHead,
};

export const reducer = combineReducers( reducers );

export function createReduxStore( initialState = {} ) {
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
		noticesMiddleware,
	].filter( Boolean );

	const enhancers = [ httpDataEnhancer, applyMiddleware( ...middlewares ) ].filter( Boolean );

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
