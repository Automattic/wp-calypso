import { isEnabled } from '@automattic/calypso-config';
import {
	useSelector as reduxUseSelector,
	useDispatch as reduxUseDispatch,
	useStore as reduxUseStore,
} from 'react-redux';
import { AnyAction, createStore, applyMiddleware, compose, Store, StoreEnhancer } from 'redux';
import dynamicMiddlewares from 'redux-dynamic-middlewares';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { WithAddReducer } from 'calypso/state/add-reducer';
import wpcomApiMiddleware from 'calypso/state/data-layer/wpcom-api-middleware';
import { addReducerEnhancer } from 'calypso/state/utils/add-reducer-enhancer';
import actionLogger from './action-log';
import consoleDispatcher from './console-dispatch';
import initialReducer from './reducer';
import { IAppState, CalypsoDispatch } from './types';

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
		isBrowser && require( './analytics/middleware.js' ).analyticsMiddleware,
		isBrowser && require( './lib/middleware.js' ).default,
		isDesktop && require( './desktop/middleware.js' ).default,
	].filter( Boolean );

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

export const useDispatch: () => CalypsoDispatch = reduxUseDispatch;

// Basically the same types as TypedUseSelectorHook but with IAppState as the default state type.
export function useSelector< State = IAppState, Selected = unknown >(
	selector: ( state: State ) => Selected,
	equalityFn?: ( a: Selected, b: Selected ) => boolean
): Selected {
	return reduxUseSelector( selector, equalityFn );
}

export function useStore(): Store< IAppState, AnyAction > {
	return reduxUseStore< IAppState >();
}
