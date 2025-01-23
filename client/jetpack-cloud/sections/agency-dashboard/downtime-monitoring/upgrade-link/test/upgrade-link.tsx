/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DashboardDataContext from '../../../sites-overview/dashboard-data-context';
import UpgradeLink from '../index';

describe( 'UpgradeLink', () => {
	const dashboardContextValue = {
		verifiedContacts: {
			emails: [],
			phoneNumbers: [],
			refetchIfFailed: jest.fn(),
		},
		products: [
			{
				name: 'Jetpack Monitor',
				slug: 'jetpack-monitor',
				product_id: 123,
				currency: 'USD',
				amount: 1,
				price_interval: 'month',
				family_slug: 'jetpack-monitor',
			},
		],
		isLargeScreen: true,
	};

	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'renders the upgrade link text inline', () => {
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<UpgradeLink isInline />
			</DashboardDataContext.Provider>,
			{ wrapper: Wrapper }
		);

		expect( upgradeLink.parentElement ).toHaveClass( 'is-inline' );
	} );
} );
