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
import SMSNotification from '../sms-notification';
import type { RestrictionType } from '../../../types';

describe( 'SMSNotification', () => {
	const defaultProps = {
		recordEvent: jest.fn(),
		enableSMSNotification: true,
		setEnableSMSNotification: jest.fn(),
		toggleModal: jest.fn(),
		allPhoneItems: [],
		restriction: 'none' as RestrictionType,
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

	it( 'renders the component with SMS notifications enabled', () => {
		render( <SMSNotification { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Disable SMS notifications' ) ).toBeInTheDocument();
		expect( screen.getByText( 'SMS Notification' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Set up text messages to send to one or more people.' )
		).toBeInTheDocument();
	} );

	it( 'renders the component with SMS notifications disabled', () => {
		render( <SMSNotification { ...defaultProps } enableSMSNotification={ false } /> );

		expect( screen.getByLabelText( 'Enable SMS notifications' ) ).toBeInTheDocument();
	} );

	it( 'renders the component with SMS notifications enabled with restriction', () => {
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<SMSNotification { ...defaultProps } restriction="upgrade_required" />
			</DashboardDataContext.Provider>,
			{
				wrapper: Wrapper,
			}
		);

		expect( screen.getByLabelText( 'Disable SMS notifications' ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Upgrade ($1.00/m)' } ) ).toBeInTheDocument();
	} );

	it( 'handles toggle change with SMS notifications enabled', () => {
		render( <SMSNotification { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Disable SMS notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'sms_notification_disable' );
		expect( defaultProps.setEnableSMSNotification ).toHaveBeenCalledWith( false );
	} );

	it( 'handles toggle change with SMS notifications disabled', () => {
		render( <SMSNotification { ...defaultProps } enableSMSNotification={ false } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Enable SMS notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'sms_notification_enable' );
		expect( defaultProps.setEnableSMSNotification ).toHaveBeenCalledWith( true );
	} );
} );
