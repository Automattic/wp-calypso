/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import FeatureRestrictionBadge from '../index';

describe( 'FeatureRestrictionBadge', () => {
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'renders the "Upgrade" badge when restriction is "upgrade_required', () => {
		render( <FeatureRestrictionBadge restriction="upgrade_required" />, { wrapper: Wrapper } );
		expect( screen.getByText( 'Upgrade' ) ).toBeInTheDocument();
	} );

	it( 'renders "Not Available" badge when restriction is "free_site_selected"', () => {
		render( <FeatureRestrictionBadge restriction="free_site_selected" />, { wrapper: Wrapper } );
		expect( screen.getByText( 'Not Available' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing when restriction is undefined', () => {
		render( <FeatureRestrictionBadge /> );
		expect( screen.queryByText( 'Upgrade' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Not Available' ) ).not.toBeInTheDocument();
	} );
} );
