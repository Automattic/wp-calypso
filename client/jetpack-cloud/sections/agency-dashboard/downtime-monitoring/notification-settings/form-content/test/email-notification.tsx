/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EmailNotification from '../email-notification';
import type { RestrictionType } from '../../../types';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property === 'jetpack/pro-dashboard-monitor-paid-tier';
	return config;
} );

describe( 'EmailNotification', () => {
	const defaultProps = {
		recordEvent: jest.fn(),
		enableEmailNotification: true,
		setEnableEmailNotification: jest.fn(),
		defaultUserEmailAddresses: [ 'example@example.com' ],
		toggleAddEmailModal: jest.fn(),
		allEmailItems: [],
		restriction: 'none' as RestrictionType,
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

	it( 'renders the component with email notifications enabled', () => {
		render( <EmailNotification { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Disable email notifications' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Receive email notifications with one or more recipients.' )
		).toBeInTheDocument();
	} );

	it( 'renders the component with email notifications disabled', () => {
		render( <EmailNotification { ...defaultProps } enableEmailNotification={ false } /> );

		expect( screen.getByLabelText( 'Enable email notifications' ) ).toBeInTheDocument();
	} );

	it( 'handles toggle change with email notifications enabled', () => {
		render( <EmailNotification { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Disable email notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'email_notification_disable' );
		expect( defaultProps.setEnableEmailNotification ).toHaveBeenCalledWith( false );
	} );

	it( 'handles toggle change with email notifications disabled', () => {
		render( <EmailNotification { ...defaultProps } enableEmailNotification={ false } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Enable email notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'email_notification_enable' );
		expect( defaultProps.setEnableEmailNotification ).toHaveBeenCalledWith( true );
	} );
} );
