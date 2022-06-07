import { render as rtlRender } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';

export const renderWithProvider = (
	ui,
	{ initialState, store, reducers, ...renderOptions } = {}
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
