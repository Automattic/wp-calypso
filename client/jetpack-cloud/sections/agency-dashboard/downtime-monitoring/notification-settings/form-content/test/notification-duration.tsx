/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DashboardDataContext from '../../../../sites-overview/dashboard-data-context';
import NotificationDuration from '../notification-duration';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property === 'jetpack/pro-dashboard-monitor-paid-tier';
	return config;
} );

describe( 'NotificationDuration', () => {
	const defaultProps = {
		selectDuration: jest.fn(),
		recordEvent: jest.fn(),
	};

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

	it( 'renders the component with selected duration and no restriction', () => {
		render(
			<NotificationDuration
				selectedDuration={ { time: 15, label: '15 minutes' } }
				{ ...defaultProps }
			/>
		);

		expect( screen.getByText( /Monitor my site every/i ) ).toBeInTheDocument();

		const selectedText = screen.getByRole( 'img', { name: 'Schedules' } );
		expect( selectedText.parentElement ).toHaveTextContent( '15 minutes' );
	} );

	it( 'handles dropdown toggle and clicks', () => {
		render( <NotificationDuration { ...defaultProps } /> );

		fireEvent.click( screen.getByRole( 'menuitem', { name: /30 minutes/i } ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'notification_duration_toggle' );
		expect( defaultProps.selectDuration ).toHaveBeenCalledWith( {
			time: 30,
			label: '30 minutes',
		} );
	} );

	it( 'renders the component with upgrade required restriction', () => {
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<NotificationDuration restriction="upgrade_required" { ...defaultProps } />
			</DashboardDataContext.Provider>,
			{
				wrapper: Wrapper,
			}
		);

		const dropdownToggle = screen.getByRole( 'menuitem', { name: /1 minute/i } );
		expect( dropdownToggle ).toHaveClass( 'is-disabled' );
		expect( dropdownToggle ).toHaveTextContent( '1 minute' );
		expect( dropdownToggle ).toHaveTextContent( 'Upgrade' );
		expect( dropdownToggle ).toHaveTextContent( 'Upgrade ($1.00/m)' );
	} );
} );
