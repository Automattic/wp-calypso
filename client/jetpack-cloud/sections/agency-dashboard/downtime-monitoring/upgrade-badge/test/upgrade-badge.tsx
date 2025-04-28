/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

	it( 'shows tooltip on mouse hover', () => {
		render( <UpgradeBadge />, { wrapper: Wrapper } );

		const badgeWrapper = screen.getByRole( 'button', { name: 'Upgrade' } );
		act( () => {
			userEvent.hover( badgeWrapper );
		} );
		waitFor( () => {
			expect( screen.getByText( 'Maximize uptime' ) ).toBeInTheDocument();
		} );
	} );
} );
