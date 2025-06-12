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
		type: 'email' as AllowedMonitorContactTypes,
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
			emails: [ 'test-verified@test.com' ],
			phoneNumbers: [],
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

	it( 'should render add email address form', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		expect( screen.getByText( 'Name' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /give this email a nickname for your personal reference/i )
		).toBeInTheDocument();

		expect( screen.getByText( 'Email' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /We’ll send a code to verify your email address/i )
		).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: /back/i } ) );
		expect( defaultProps.onClose ).toHaveBeenCalledTimes( 1 );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		expect( verifyButton ).toHaveTextContent( /verify/i );
		expect( verifyButton ).toHaveAttribute( 'disabled' );
	} );

	it( 'should show invalid email address error', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );
		fireEvent.change( screen.getByLabelText( 'Email' ), {
			target: { value: 'testtest.com' },
		} );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect( screen.getByText( /please enter a valid email address/i ) ).toBeInTheDocument();
	} );

	it( 'should add the email address if already verified', async () => {
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
		fireEvent.change( screen.getByLabelText( 'Email' ), {
			target: { value: 'test-verified@test.com' },
		} );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect( onAdd ).toHaveBeenCalledWith(
			{ email: 'test-verified@test.com', name: 'test' },
			true,
			'downtime_monitoring_email__already_verified'
		);
	} );

	it( 'should should an error if the email address is already added', async () => {
		const props = {
			...defaultProps,
			contacts: [
				{
					email: 'test@test.com',
					name: 'test',
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
		fireEvent.change( screen.getByLabelText( 'Email' ), {
			target: { value: 'test@test.com' },
		} );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		expect( screen.getByText( /this email address is already in use/i ) ).toBeInTheDocument();
	} );

	it( 'should add the email address if later is clicked', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );
		fireEvent.change( screen.getByLabelText( 'Email' ), {
			target: { value: 'test@test.com' },
		} );

		expect( verifyButton ).not.toHaveAttribute( 'disabled' );

		fireEvent.click( verifyButton );
		expect( verifyButton ).toHaveAttribute( 'disabled' );
		// Wait for the API call to finish
		await waitFor( () => {
			expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		} );

		const codeLabel = /please enter the code you received via email/i;
		expect( screen.getByText( codeLabel ) ).toBeInTheDocument();

		const saveLaterButton = screen.getByRole( 'button', { name: /later/i } );
		expect( saveLaterButton ).toBeInTheDocument();
		fireEvent.click( saveLaterButton );
		expect( onAdd ).toHaveBeenCalledWith(
			{ email: 'test@test.com', name: 'test' },
			false,
			'downtime_monitoring_verify_email_later'
		);

		const promise = Promise.resolve();
		await act( () => promise );
	} );

	it( 'should verify the email address', async () => {
		const onAdd = jest.fn();
		render( <VerifyContactForm onAdd={ onAdd } { ...defaultProps } />, {
			wrapper: Wrapper,
		} );

		fireEvent.change( screen.getByLabelText( 'Name' ), {
			target: { value: 'test' },
		} );
		fireEvent.change( screen.getByLabelText( 'Email' ), {
			target: { value: 'test@test.com' },
		} );

		const verifyButton = screen.getByTestId( 'submit-verify-contact' );
		fireEvent.click( verifyButton );
		// Wait for the API call to finish
		await waitFor( () => {
			expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		} );
		expect( verifyButton ).toHaveAttribute( 'disabled' );

		const codeLabel = /please enter the code you received via email/i;
		fireEvent.change( screen.getByLabelText( codeLabel ), {
			target: { value: '123456' },
		} );

		expect( verifyButton ).not.toHaveAttribute( 'disabled' );
		fireEvent.click( verifyButton );
		await waitFor( () => {
			expect( onAdd ).toHaveBeenCalledWith(
				{ email: 'test@test.com', name: 'test', verificationCode: '123456' },
				true
			);
		} );

		const promise = Promise.resolve();
		await act( () => promise );
	} );
} );
