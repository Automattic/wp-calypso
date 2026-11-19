import { isEnabled } from '@automattic/calypso-config';
import { createStore, applyMiddleware, compose } from 'redux';
import dynamicMiddlewares from 'redux-dynamic-middlewares';
import { thunk as thunkMiddleware } from 'redux-thunk';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { addReducerEnhancer } from 'calypso/state/utils/add-reducer-enhancer';
import actionLogger from './action-log';
import { analyticsMiddleware } from './analytics/middleware.js';
import consoleDispatcher from './console-dispatch';
import desktopMiddleware from './desktop/middleware.js';
import libraryMiddleware from './lib/middleware.js';
import initialReducer from './reducer';
import type { WithAddReducer } from 'calypso/state/add-reducer';
import type { Middleware, Store, StoreEnhancer } from 'redux';

export function createReduxStore(
	initialState: Record< string, unknown >,
	reducer = initialReducer
): Store & WithAddReducer {
	const isBrowser = typeof window === 'object';
	const isDesktop = isEnabled( 'desktop' );

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
		dynamicMiddlewares,
		isBrowser && analyticsMiddleware,
		isBrowser && libraryMiddleware,
		isDesktop && desktopMiddleware,
	].filter( ( middleware ): middleware is Middleware => Boolean( middleware ) );

	const enhancers = [
		addReducerEnhancer,
		isBrowser && window.app && window.app.isDebug && consoleDispatcher,
		applyMiddleware( ...middlewares ),
		isBrowser && window.app && window.app.isDebug && actionLogger,
		isBrowser && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	].filter( Boolean );

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore The store enhancer types don't line up exactly and it's not worth fixing immediately.
	return createStore( reducer, initialState, compose< StoreEnhancer >( ...enhancers ) );
}
