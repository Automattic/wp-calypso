import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, renderHook as rtlRenderHook } from '@testing-library/react';
import { Fragment } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { createReduxStore } from 'calypso/state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';

export const renderWithProvider = (
	ui,
	{ initialState, store = null, reducers, additionalActions = [], ...renderOptions } = {}
) => {
	const queryClient = new QueryClient();

	if ( ! store ) {
		let reducer = initialReducer;

		if ( typeof reducers === 'object' ) {
			for ( const key in reducers ) {
				reducer = reducer.addReducer( [ key ], reducers[ key ] );
			}
		}

		store = createStore( reducer, initialState, applyMiddleware( thunkMiddleware ) );
	}

	setStore( store );

	if ( additionalActions && additionalActions.length > 0 ) {
		additionalActions.forEach( ( action ) => {
			store.dispatch( action );
		} );
	}

	const Wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);

	return rtlRender( ui, { wrapper: Wrapper, ...renderOptions } );
};

export const statefulRenderWithProvider = (
	ui,
	{ initialState, additionalActions = [], reducers, ...renderOptions } = {}
) => {
	let reducer = initialReducer;

	if ( typeof reducers === 'object' ) {
		for ( const key in reducers ) {
			reducer = reducer.addReducer( [ key ], reducers[ key ] );
		}
	}

	const store = createReduxStore( initialState, reducer );

	/*
	setStore( store );

	if ( additionalActions && additionalActions.length > 0 ) {
		additionalActions.forEach( ( action ) => {
			store.dispatch( action );
		} );
	}
	*/

	return renderWithProvider( ui, { store, additionalActions, ...renderOptions } );
};

export const renderHookWithProvider = ( hookContainer, options = {} ) => {
	const { initialState, reducers, wrapper, ...renderOptions } = options;
	const queryClient = new QueryClient();
	const Wrapper = wrapper || Fragment;
	let store = options.store || null;

	if ( ! store ) {
		let reducer = initialReducer;

		if ( typeof reducers === 'object' ) {
			for ( const key in reducers ) {
				reducer = reducer.addReducer( [ key ], reducers[ key ] );
			}
		}

		store = createStore( reducer, initialState, applyMiddleware( thunkMiddleware ) );
	}

	const WrapperWithClient = ( { children } ) => (
		<Wrapper>
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		</Wrapper>
	);

	return {
		store,
		...rtlRenderHook( hookContainer, { wrapper: WrapperWithClient, ...renderOptions } ),
	};
};
