/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { site } from '../../../sites-overview/test/test-utils/constants';
import NotificationSettings from '../index';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = ( property: string ) => property.startsWith( 'jetpack/pro-dashboard-monitor' );
	return config;
} );

describe( 'NotificationSettings', () => {
	const sites = [ site ];

	const initialState = {
		a8cForAgencies: { agencies: {} },
	};

	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		</Provider>
	);

	it( 'should render the site monitor settings for single site', () => {
		const onClose = jest.fn();
		render( <NotificationSettings sites={ sites } onClose={ onClose } />, {
			wrapper: Wrapper,
		} );

		expect( screen.getByText( /set custom notification/i ) ).toBeInTheDocument();
		expect( screen.getByText( site.url ) ).toBeInTheDocument();

		expect( screen.getByText( /Monitor my site every/i ) ).toBeInTheDocument();
		expect( screen.getAllByText( /\d+ minutes/i ).at( 0 ) ).toBeInTheDocument();

		expect( screen.getByText( 'SMS Notification' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /set up text messages to send to one or more people./i )
		).toBeInTheDocument();

		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /receive email notifications with one or more recipients./i )
		).toBeInTheDocument();

		expect( screen.getByText( 'Push' ) ).toBeInTheDocument();
		expect( screen.getByText( /receive notifications via the/i ) ).toBeInTheDocument();

		expect(
			screen.queryByText( /settings for selected sites will be overwritten./i )
		).not.toBeInTheDocument();
	} );

	it( 'should render the site monitor settings for bulk edit', () => {
		const onClose = jest.fn();
		render(
			<NotificationSettings
				sites={ sites }
				onClose={ onClose }
				bulkUpdateSettings={ site.monitor_settings }
			/>,
			{
				wrapper: Wrapper,
			}
		);

		expect(
			screen.getByText( /settings for selected sites will be overwritten./i )
		).toBeInTheDocument();
	} );

	it( 'should show the appropriate error messages', () => {
		const onClose = jest.fn();
		render( <NotificationSettings sites={ sites } onClose={ onClose } />, {
			wrapper: Wrapper,
		} );

		const cancelButton = screen.getByRole( 'button', { name: /cancel/i } );
		fireEvent.click( cancelButton );
		expect( onClose ).toHaveBeenCalled();

		const saveButton = screen.getByRole( 'button', { name: /save/i } );
		expect( saveButton ).toBeDisabled();

		fireEvent.click( screen.getByRole( 'menuitem', { name: /15 minutes/i } ) );
		expect( saveButton ).toBeEnabled();
		fireEvent.click( saveButton );
		expect( screen.getByText( /please select at least one contact method/i ) ).toBeInTheDocument();

		const smsCheckbox = screen.getByRole( 'checkbox', { name: /enable sms notifications/i } );
		fireEvent.click( smsCheckbox );
		expect( smsCheckbox ).toBeChecked();
		fireEvent.click( saveButton );
		expect( screen.getByText( /please add at least one phone number/i ) ).toBeInTheDocument();
	} );
} );
