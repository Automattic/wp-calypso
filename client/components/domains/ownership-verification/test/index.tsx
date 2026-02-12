/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OwnershipVerification from '../index';

describe( 'OwnershipVerification', () => {
	const defaultProps = {
		domainName: 'example.com',
		onConnect: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render the component with all required elements', () => {
		const { getByText, getByRole } = render( <OwnershipVerification { ...defaultProps } /> );

		// Check main text
		expect( getByText( 'Enter the authorization code for your domain.' ) ).toBeVisible();

		// Check authorization code field exists
		expect( getByRole( 'textbox', { name: /authorization code/i } ) ).toBeVisible();

		// Check submit button
		expect( getByRole( 'button', { name: /connect domain/i } ) ).toBeVisible();

		// Check info notice
		expect(
			getByText(
				'This will only be used to verify that you own this domain, we will not transfer it.'
			)
		).toBeVisible();
	} );

	test( 'should display the domain name in the instructions', () => {
		const { getByText } = render( <OwnershipVerification { ...defaultProps } /> );

		expect( getByText( defaultProps.domainName ) ).toBeVisible();
	} );

	test( 'should allow user to type in the authorization code field', async () => {
		const user = userEvent.setup();
		const { getByRole } = render( <OwnershipVerification { ...defaultProps } /> );

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const testAuthCode = 'ABC123DEF456';

		await user.type( authCodeInput, testAuthCode );

		expect( authCodeInput ).toHaveValue( testAuthCode );
	} );

	test( 'should call onConnect with correct data when form is submitted', async () => {
		const user = userEvent.setup();
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( null ), 0 );
		} );
		const { getByRole } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );
		const testAuthCode = 'ABC123DEF456';

		await user.type( authCodeInput, testAuthCode );
		await user.click( submitButton );

		expect( mockOnConnect ).toHaveBeenCalledTimes( 1 );
		expect( mockOnConnect ).toHaveBeenCalledWith(
			{
				verificationData: {
					ownership_verification_data: {
						verification_type: 'auth_code',
						verification_data: testAuthCode,
					},
				},
				domain: defaultProps.domainName,
			},
			expect.any( Function )
		);

		// Wait for the state to settle
		await waitFor( () => expect( submitButton ).not.toBeDisabled() );
	} );

	test( 'should disable the submit button while submitting', async () => {
		const user = userEvent.setup();
		const mockOnConnect = jest.fn();

		const { getByRole } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		expect( submitButton ).not.toBeDisabled();

		await user.type( authCodeInput, 'ABC123' );
		await user.click( submitButton );

		// Button should be disabled immediately after clicking
		await waitFor( () => expect( submitButton ).toBeDisabled() );
	} );

	test( 'should display error message when onConnect callback returns an Error', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Invalid authorization code';
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( new Error( errorMessage ) ), 0 );
		} );

		const { getByRole, getByText } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		await user.type( authCodeInput, 'WRONGCODE' );
		await user.click( submitButton );

		await waitFor( () => expect( getByText( errorMessage ) ).toBeVisible() );
	} );

	test( 'should display error message when onConnect callback returns an error object with message', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Domain verification failed';
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( { message: errorMessage } ), 0 );
		} );

		const { getByRole, getByText } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		await user.type( authCodeInput, 'WRONGCODE' );
		await user.click( submitButton );

		await waitFor( () => expect( getByText( errorMessage ) ).toBeVisible() );
	} );

	test( 'should display error message when onConnect callback returns an error object with error property', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Authentication failed';
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( { error: errorMessage } ), 0 );
		} );

		const { getByRole, getByText } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		await user.type( authCodeInput, 'WRONGCODE' );
		await user.click( submitButton );

		await waitFor( () => expect( getByText( errorMessage ) ).toBeVisible() );
	} );

	test( 'should display generic error message when error object has no message or error property', async () => {
		const user = userEvent.setup();
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( {} ), 0 );
		} );

		const { getByRole, getByText } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		await user.type( authCodeInput, 'WRONGCODE' );
		await user.click( submitButton );

		await waitFor( () =>
			expect( getByText( 'An error occurred while connecting the domain.' ) ).toBeVisible()
		);
	} );

	test( 'should re-enable submit button after submission completes with error', async () => {
		const user = userEvent.setup();
		const mockOnConnect = jest.fn( ( data, callback ) => {
			setTimeout( () => callback( new Error( 'Test error' ) ), 0 );
		} );

		const { getByRole } = render(
			<OwnershipVerification { ...defaultProps } onConnect={ mockOnConnect } />
		);

		const authCodeInput = getByRole( 'textbox', { name: /authorization code/i } );
		const submitButton = getByRole( 'button', { name: /connect domain/i } );

		await user.type( authCodeInput, 'ABC123' );
		await user.click( submitButton );

		// Button should be enabled again after error
		await waitFor( () => expect( submitButton ).not.toBeDisabled() );
	} );

	test( 'should contain link to site profiler tool', () => {
		const { getByRole } = render( <OwnershipVerification { ...defaultProps } /> );

		const link = getByRole( 'link', { name: /lookup tool/i } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/site-profiler' );
	} );
} );
