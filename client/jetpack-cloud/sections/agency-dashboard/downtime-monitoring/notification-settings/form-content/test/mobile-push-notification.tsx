/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MobilePushNotification from '../mobile-push-notification';

describe( 'MobilePushNotification', () => {
	const defaultProps = {
		recordEvent: jest.fn(),
		enableMobileNotification: true,
		setEnableMobileNotification: jest.fn(),
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

	it( 'renders the component with mobile notifications enabled', () => {
		render( <MobilePushNotification { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Disable mobile notifications' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Push' ) ).toBeInTheDocument();
		expect( screen.getByText( /receive notifications via the/i ) ).toBeInTheDocument();

		const link = screen.getByRole( 'link' );
		expect( link ).toBeInTheDocument();

		const EXPECTED_LINK_HREF = 'https://jetpack.com/mobile/';
		expect( link ).toHaveAttribute( 'href', EXPECTED_LINK_HREF );
	} );

	it( 'renders the component with mobile notifications disabled', () => {
		render( <MobilePushNotification { ...defaultProps } enableMobileNotification={ false } /> );

		expect( screen.getByLabelText( 'Enable mobile notifications' ) ).toBeInTheDocument();
	} );

	it( 'handles toggle change with mobile notifications enabled', () => {
		render( <MobilePushNotification { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Disable mobile notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'mobile_notification_disable' );
		expect( defaultProps.setEnableMobileNotification ).toHaveBeenCalledWith( false );
	} );

	it( 'handles toggle change with mobile notifications disabled', () => {
		render( <MobilePushNotification { ...defaultProps } enableMobileNotification={ false } />, {
			wrapper: Wrapper,
		} );

		fireEvent.click( screen.getByLabelText( 'Enable mobile notifications' ) );
		expect( defaultProps.recordEvent ).toHaveBeenCalledWith( 'mobile_notification_enable' );
		expect( defaultProps.setEnableMobileNotification ).toHaveBeenCalledWith( true );
	} );
} );
