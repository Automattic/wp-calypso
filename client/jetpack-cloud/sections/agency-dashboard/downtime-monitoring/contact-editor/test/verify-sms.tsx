/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DashboardDataContext from '../../../sites-overview/dashboard-data-context';
import {
	AllowedMonitorContactTypes,
	AllowedMonitorContactActions,
	StateMonitoringSettingsContact,
} from '../../../sites-overview/types';
import VerifyContactForm from '../verify';

jest.mock( 'calypso/data/geo/use-geolocation-query', () => ( {
	useGeoLocationQuery: () => ( {
		isLoading: false,
		data: {},
	} ),
} ) );

jest.mock( '../hooks', () => ( {
	...jest.requireActual( '../hooks' ),
	useGetSupportedSMSCountries: () => [
		// Alphabetical order
		{
			code: 'AF',
			name: 'Afghanistan',
			numeric_code: '+93',
			country_name: 'Afghanistan',
		},
		{
			code: 'AL',
			name: 'Albania',
			numeric_code: '+355',
			country_name: 'Albania',
		},
	],
} ) );

describe( 'VerifyContactForm', () => {
	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.post( '/wpcom/v2/jetpack-agency/contacts' )
			.reply( 200 );
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/jetpack-agency/contacts/verify' )
			.reply( 200 );
	} );

	afterAll( () => {
		nock.cleanAll();
	} );

	const defaultProps = {
		type: 'sms' as AllowedMonitorContactTypes,
		contacts: [],
		setContacts: jest.fn(),
		action: 'add' as AllowedMonitorContactActions,
		setVerifiedContact: jest.fn(),
		recordEvent: jest.fn(),
		onClose: jest.fn(),
		sites: [],
	};

	const dashboardContextValue = {
		verifiedContacts: {
			emails: [],
			phoneNumbers: [ '+93774405234' ],
			refetchIfFailed: jest.fn(),
		},
		products: [],
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

	it( 'should render add phone number form', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /give this number a nickname for your personal reference/i )
		).toBeInTheDocument();

		expect( screen.getByText( /country code/i ) ).toBeInTheDocument();
		expect( screen.getByText( 'Phone number' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /We’ll send a code to verify your phone number/i )
		).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( defaultProps.onClose ).toHaveBeenCalledTimes( 1 );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );

		expect( verifyButton ).toHaveTextContent( /verify/i );
		expect( verifyButton ).toHaveAttribute( 'disabled' );
	} );

	it( 'should show invalid phone number error', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /afghanistan/i ) );
		const selectElement = screen.getByTestId( 'country-code-select' );
		fireEvent.change( selectElement, { target: { value: 'AF' } } );

		const inputElement = screen.getByTestId( 'phone-number-input' );
		fireEvent.change( inputElement, { target: { value: '77012222' } } );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect(
			screen.getByText( /that phone number does not appear to be valid/i )
		).toBeInTheDocument();
	} );

	it( 'should add the phone number if already verified', async () => {
		const onAdd = jest.fn();
		render(
			<DashboardDataContext.Provider value={ dashboardContextValue }>
				<VerifyContactForm onAdd={ onAdd } { ...defaultProps } />
			</DashboardDataContext.Provider>,
			{
				wrapper: Wrapper,
			}
		);
		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /afghanistan/i ) );
		const selectElement = screen.getByTestId( 'country-code-select' );
		fireEvent.change( selectElement, { target: { value: 'AF' } } );

		const inputElement = screen.getByTestId( 'phone-number-input' );
		fireEvent.change( inputElement, { target: { value: '0774405234' } } );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect( onAdd ).toHaveBeenCalledWith(
			{
				countryCode: 'AF',
				countryNumericCode: '+93',
				phoneNumber: '774405234',
				phoneNumberFull: '+93774405234',
				name: 'test',
			},
			true,
			'downtime_monitoring_phone_number_already_verified'
		);
	} );

	it( 'should should an error if the phone number is already added', async () => {
		const props = {
			...defaultProps,
			contacts: [
				{
					name: 'test',
					countryCode: 'AF',
					phoneNumber: '774405234',
					phoneNumberFull: '+93774405234',
					verified: true,
				},
			] as Array< StateMonitoringSettingsContact >,
		};
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...props } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /afghanistan/i ) );
		const selectElement = screen.getByTestId( 'country-code-select' );
		fireEvent.change( selectElement, { target: { value: 'AF' } } );

		const inputElement = screen.getByTestId( 'phone-number-input' );
		fireEvent.change( inputElement, { target: { value: '0774405234' } } );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect( screen.getByText( /this phone number is already in use/i ) ).toBeInTheDocument();
	} );

	it( 'should add the phone number if later is clicked', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /afghanistan/i ) );
		const selectElement = screen.getByTestId( 'country-code-select' );
		fireEvent.change( selectElement, { target: { value: 'AF' } } );

		const inputElement = screen.getByTestId( 'phone-number-input' );
		fireEvent.change( inputElement, { target: { value: '0774405234' } } );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		fireEvent.click( verifyButton );
		expect( verifyButton ).toHaveAttribute( 'disabled' );
		// Wait for the API call to finish
		await waitFor( () => {
			expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		} );

		const codeLabel = /please enter the code you received via sms/i;
		expect( screen.getByText( codeLabel ) ).toBeInTheDocument();

		const saveLaterButton = screen.getByRole( 'button', { name: /later/i } );
		expect( saveLaterButton ).toBeInTheDocument();
		fireEvent.click( saveLaterButton );
		expect( onAdd ).toHaveBeenCalledWith(
			{
				countryCode: 'AF',
				countryNumericCode: '+93',
				phoneNumber: '774405234',
				phoneNumberFull: '+93774405234',
				name: 'test',
			},
			false,
			'downtime_monitoring_verify_phone_number_later'
		);

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	it( 'should verify the phone number', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );

		fireEvent.click( screen.getByText( /afghanistan/i ) );
		const selectElement = screen.getByTestId( 'country-code-select' );
		fireEvent.change( selectElement, { target: { value: 'AF' } } );

		const inputElement = screen.getByTestId( 'phone-number-input' );
		fireEvent.change( inputElement, { target: { value: '0774405234' } } );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		// Wait for the API call to finish
		await waitFor( () => {
			expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		} );

		expect( verifyButton ).toHaveAttribute( 'disabled' );

		const codeLabel = /please enter the code you received via sms/i;
		fireEvent.change( screen.getByLabelText( codeLabel ), {
			target: { value: '123456' },
		} );

		expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		fireEvent.click( verifyButton );
		await waitFor( () => {
			expect( onAdd ).toHaveBeenCalledWith(
				{
					countryCode: 'AF',
					countryNumericCode: '+93',
					phoneNumber: '774405234',
					phoneNumberFull: '+93774405234',
					name: 'test',
					verificationCode: '123456',
				},
				true
			);
		} );

		const promise = Promise.resolve();
		await act( () => promise );
	} );
} );
