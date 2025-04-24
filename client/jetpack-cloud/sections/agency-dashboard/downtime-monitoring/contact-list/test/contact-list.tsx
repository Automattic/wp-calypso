/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DashboardDataContext from '../../../sites-overview/dashboard-data-context';
import ContactList from '../index';

describe( 'ContactList', () => {
	const mockedEmailItems = [
		{
			email: 'test@test.com',
			name: 'test',
			verified: true,
			isDefault: true,
		},
	];
	const mockedPhoneItems = [
		{
			name: 'test',
			countryCode: 'AF',
			countryNumericCode: '+93',
			phoneNumber: '774405234',
			phoneNumberFull: '+93774405234',
			verified: true,
		},
	];

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

	it( 'should render the add email button', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		render(
			<ContactList
				onAction={ mockedOnAction }
				type="email"
				items={ mockedEmailItems }
				recordEvent={ mockedRecordEvent }
			/>,
			{
				wrapper: Wrapper,
			}
		);

		const addButton = screen.getByRole( 'button', { name: /add email address/i } );
		expect( addButton ).toBeInTheDocument();

		fireEvent.click( addButton );
		expect( mockedOnAction ).toHaveBeenCalledTimes( 1 );
		expect( mockedRecordEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should show the upgrade path for email', () => {
		const mockedOnAction = jest.fn();
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<ContactList
					restriction="upgrade_required"
					onAction={ mockedOnAction }
					type="email"
					items={ mockedEmailItems }
				/>
				,
			</DashboardDataContext.Provider>,

			{
				wrapper: Wrapper,
			}
		);

		expect( screen.getByRole( 'button', { name: /add email address/i } ) ).toHaveAttribute(
			'disabled'
		);

		const upgradeBadge = screen.getByRole( 'button', { name: 'Upgrade' } );
		expect( upgradeBadge ).toBeInTheDocument();

		const upgradeLink = screen.getByRole( 'button', { name: 'Upgrade ($1.00/m)' } );
		expect( upgradeLink ).toBeInTheDocument();

		expect(
			screen.getByText( /multiple email recipients is part of the basic plan./i )
		).toBeInTheDocument();
	} );

	it( 'should render the add phone number button', () => {
		const mockedOnAction = jest.fn();
		render( <ContactList onAction={ mockedOnAction } type="sms" items={ [] } />, {
			wrapper: Wrapper,
		} );

		const addButton = screen.getByRole( 'button', { name: /Add phone number/i } );
		expect( addButton ).toBeInTheDocument();
		fireEvent.click( addButton );
		expect( mockedOnAction ).toHaveBeenCalledTimes( 1 );

		expect( screen.getByText( /you need at least one phone number/i ) ).toBeInTheDocument();
	} );

	it( 'should not render the add phone number button if there is one contact added', () => {
		const mockedOnAction = jest.fn();
		render( <ContactList onAction={ mockedOnAction } type="sms" items={ mockedPhoneItems } />, {
			wrapper: Wrapper,
		} );

		expect( screen.queryByRole( 'button', { name: /Add phone number/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /you need at least one phone number/i ) ).not.toBeInTheDocument();
	} );
} );
