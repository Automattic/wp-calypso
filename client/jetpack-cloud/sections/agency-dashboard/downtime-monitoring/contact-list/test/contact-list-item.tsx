/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ContactListItem from '../item';

describe( 'ContactListItem', () => {
	const mockedEmailItem = {
		email: 'test@test.com',
		name: 'test',
		verified: true,
		isDefault: true,
	};
	const mockedPhoneItem = {
		name: 'test',
		countryCode: 'AF',
		countryNumericCode: '+93',
		phoneNumber: '774405234',
		phoneNumberFull: '+93774405234',
		verified: true,
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

	it( 'should render the default contact', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		render(
			<ContactListItem
				item={ mockedEmailItem }
				onAction={ mockedOnAction }
				recordEvent={ mockedRecordEvent }
				type="email"
			/>,
			{
				wrapper: Wrapper,
			}
		);
		expect( screen.queryByRole( 'button', { name: /more actions/i } ) ).not.toBeInTheDocument();
	} );

	it( 'should render the verified contact', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		render(
			<ContactListItem
				item={ mockedPhoneItem }
				onAction={ mockedOnAction }
				recordEvent={ mockedRecordEvent }
				showVerifiedBadge
				type="sms"
			/>,
			{
				wrapper: Wrapper,
			}
		);

		expect( screen.getByText( /verified/i ) ).toBeInTheDocument();
	} );

	it( 'should render the unverified contact', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		render(
			<ContactListItem
				item={ { ...mockedEmailItem, isDefault: false, verified: false } }
				onAction={ mockedOnAction }
				recordEvent={ mockedRecordEvent }
				type="email"
			/>,
			{
				wrapper: Wrapper,
			}
		);
		expect( screen.getByText( /pending/i ) ).toBeInTheDocument();
	} );

	it( 'should render contact actions when a contact is verified', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		render(
			<ContactListItem
				item={ mockedPhoneItem }
				onAction={ mockedOnAction }
				recordEvent={ mockedRecordEvent }
				showVerifiedBadge
				type="sms"
			/>,
			{
				wrapper: Wrapper,
			}
		);

		const moreActionButton = screen.getByRole( 'button', { name: /more actions/i } );
		expect( moreActionButton ).toBeInTheDocument();

		fireEvent.click( moreActionButton );

		expect( screen.queryByRole( 'menuitem', { name: /verify/i } ) ).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'menuitem', { name: /edit/i } ) );
		expect( mockedOnAction ).toHaveBeenCalledWith( mockedPhoneItem, 'edit' );
		expect( mockedRecordEvent ).toHaveBeenCalledWith(
			'downtime_monitoring_phone_number_edit_click'
		);

		fireEvent.click( moreActionButton );
		fireEvent.click( screen.getByRole( 'menuitem', { name: /remove/i } ) );
		expect( mockedOnAction ).toHaveBeenCalledWith( mockedPhoneItem, 'remove' );
		expect( mockedRecordEvent ).toHaveBeenCalledWith(
			'downtime_monitoring_phone_number_remove_click'
		);
	} );

	it( 'should render contact actions when a contact is not verified', () => {
		const mockedOnAction = jest.fn();
		const mockedRecordEvent = jest.fn();
		const emailItem = { ...mockedEmailItem, verified: false, isDefault: false };
		render(
			<ContactListItem
				item={ emailItem }
				onAction={ mockedOnAction }
				recordEvent={ mockedRecordEvent }
				showVerifiedBadge
				type="email"
			/>,
			{
				wrapper: Wrapper,
			}
		);

		const moreActionButton = screen.getByRole( 'button', { name: /more actions/i } );
		expect( moreActionButton ).toBeInTheDocument();

		fireEvent.click( moreActionButton );

		expect( screen.getByRole( 'menuitem', { name: /edit/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: /remove/i } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'menuitem', { name: /verify/i } ) );
		expect( mockedOnAction ).toHaveBeenCalledWith( emailItem, 'verify' );
		expect( mockedRecordEvent ).toHaveBeenCalledWith(
			'downtime_monitoring_email_address_verify_click'
		);
	} );
} );
