import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, renderHook as rtlRenderHook } from '@testing-library/react';
import { Fragment } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';
import { setRoute } from 'calypso/state/route/actions';
import routeReducer from 'calypso/state/route/reducer';

export const renderWithProvider = (
	ui,
	{ initialPath, initialState, store = null, reducers, ...renderOptions } = {}
) => {
	const queryClient = new QueryClient();

	if ( ! store ) {
		let reducer = initialReducer;

		if ( typeof reducers === 'object' ) {
			for ( const key in reducers ) {
				reducer = reducer.addReducer( [ key ], reducers[ key ] );
			}
		}

		if ( initialPath ) {
			reducer = reducer.addReducer( [ 'route' ], routeReducer );
		}

		store = createStore( reducer, initialState, applyMiddleware( thunkMiddleware ) );

		if ( initialPath ) {
			const { pathname, search } = new URL( window.location.href + initialPath );
			const searchParams = new URLSearchParams( search );
			const query = Object.fromEntries( searchParams.entries() );
			store.dispatch( setRoute( pathname, query ) );
		}
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
