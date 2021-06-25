/**
 * External dependencies
 */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render as rtlRender } from '@testing-library/react';

/**
 * Internal dependencies
 */
import initialReducer from 'calypso/state/reducer';

const render = ( ui, { initialState, store, reducers, ...renderOptions } = {} ) => {
	if ( ! store ) {
		let reducer = initialReducer;

		if ( typeof reducers === 'object' ) {
			for ( const key in reducers ) {
				reducer = reducer.addReducer( [ key ], reducers[ key ] );
			}
		}

		store = createStore( reducer, initialState );
	}

	const Wrapper = ( { children } ) => <Provider store={ store }>{ children }</Provider>;

	return rtlRender( ui, { wrapper: Wrapper, ...renderOptions } );
};

export * from '@testing-library/react';

export { render };
