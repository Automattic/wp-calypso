/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SitesOverviewContext from '../../../sites-overview/context';
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

	it( 'renders the upgrade link text', () => {
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<UpgradeLink />
			</DashboardDataContext.Provider>,
			{ wrapper: Wrapper }
		);
		const upgradeLink = screen.getByText( 'Upgrade ($1.00/m)' );
		expect( upgradeLink ).toBeInTheDocument();
	} );

	it( 'renders the upgrade link text and onclick works', () => {
		const mockShowLicenseInfo = jest.fn();

		render(
			// We need only the showLicenseInfo function from the context
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			<SitesOverviewContext.Provider value={ { showLicenseInfo: mockShowLicenseInfo } }>
				<DashboardDataContext.Provider value={ dashboardContextValue }>
					<UpgradeLink />
				</DashboardDataContext.Provider>
			</SitesOverviewContext.Provider>,
			{ wrapper: Wrapper }
		);
		const upgradeLink = screen.getByText( 'Upgrade ($1.00/m)' );
		expect( upgradeLink ).toBeInTheDocument();
		fireEvent.click( upgradeLink );
		expect( mockShowLicenseInfo ).toHaveBeenCalledWith( 'monitor' );
	} );

	it( 'renders the upgrade link text inline', () => {
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<UpgradeLink isInline />
			</DashboardDataContext.Provider>,
			{ wrapper: Wrapper }
		);

		const upgradeLink = screen.getByText( 'Upgrade ($1.00/m)' );
		expect( upgradeLink.parentElement ).toHaveClass( 'is-inline' );
	} );

	it( 'renders the upgrade link text when the price is undefined', () => {
		render(
			<DashboardDataContext.Provider value={ { ...dashboardContextValue, products: [] } }>
				<UpgradeLink />
			</DashboardDataContext.Provider>,
			{ wrapper: Wrapper }
		);
		const upgradeLink = screen.getByText( 'Upgrade' );
		expect( upgradeLink ).toBeInTheDocument();
	} );
} );
