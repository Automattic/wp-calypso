import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, renderHook as rtlRenderHook } from '@testing-library/react';
import { Fragment } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';

export const renderWithProvider = (
	ui,
	{ initialState, store = null, reducers, ...renderOptions } = {}
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

	const Wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);

	return rtlRender( ui, { wrapper: Wrapper, ...renderOptions } );
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
