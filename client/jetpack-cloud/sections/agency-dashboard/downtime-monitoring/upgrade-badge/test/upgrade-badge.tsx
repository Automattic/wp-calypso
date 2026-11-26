/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import UpgradeBadge from '../index';

describe( 'UpgradeBadge', () => {
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'renders the badge text', () => {
		render( <UpgradeBadge />, { wrapper: Wrapper } );
		const badge = screen.getByText( 'Upgrade' );
		expect( badge ).toBeInTheDocument();
	} );
} );
