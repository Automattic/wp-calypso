/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import PasswordlessSignupForm from '../passwordless';

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( 'calypso/blocks/login/blackbox-challenge', () => {
	const { useEffect } = require( 'react' );
	// Stand-in widget that reports "not blocking" so an enabled form stays submittable.
	return ( { onSubmitBlockedChange } ) => {
		useEffect( () => onSubmitBlockedChange?.( false ), [ onSubmitBlockedChange ] );
		return null;
	};
} );

describe( 'createAccountError', () => {
	const mockStore = configureStore( [ thunk ] );

	it( 'renders connect-screen action buttons when enabled', () => {
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<PasswordlessSignupForm useConnectScreenActions submitButtonLabel="Continue" />
			</Provider>
		);

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeInTheDocument();
		expect( document.querySelector( '.connect-screen-action-buttons' ) ).toBeInTheDocument();
	} );

	const renderFormAndSubmit = async () => {
		const onCreateAccountError = jest.fn();
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<PasswordlessSignupForm onCreateAccountError={ onCreateAccountError } />
			</Provider>
		);

		const emailInput = screen.getByRole( 'textbox', { name: /email/i } );
		fireEvent.change( emailInput, { target: { value: 'test@example.com' } } );

		const submitButton = screen.getByRole( 'button', { name: /create your account/i } );
		fireEvent.click( submitButton );
	};

	it( 'should handle throttled errors', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/users/new' ).reply( 403, {
			error: 'throttled',
		} );

		await renderFormAndSubmit();

		await waitFor( () => {
			expect( screen.getByText( /Too many attempts/i ) ).toBeInTheDocument();
		} );
	} );

	it( 'should handle generic errors', async () => {
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/users/new' ).reply( 500, {
			error: 'internal_server_error',
		} );

		await renderFormAndSubmit();

		await waitFor( () => {
			expect( screen.getByText( /couldn.t create your account/i ) ).toBeInTheDocument();
		} );
	} );
} );

describe( 'activation email source', () => {
	const mockStore = configureStore( [ thunk ] );

	// The response doesn't matter — what is being asserted is what was asked for.
	const submitWith = async ( props ) => {
		const sent = [];
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/users/new', ( body ) => {
				sent.push( body );
				return true;
			} )
			.reply( 500, { error: 'internal_server_error' } );

		render(
			<Provider store={ mockStore( {} ) }>
				<PasswordlessSignupForm flowName="onboarding" { ...props } />
			</Provider>
		);

		fireEvent.change( screen.getByRole( 'textbox', { name: /email/i } ), {
			target: { value: 'test@example.com' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );

		await waitFor( () => expect( sent ).toHaveLength( 1 ) );
		return sent[ 0 ];
	};

	it( 'names the caller when given one, without displacing what extra already carries', async () => {
		const body = await submitWith( { activationEmailFrom: 'onboarding-with-email-verification' } );

		expect( body.extra ).toEqual( {
			has_segmentation_survey: false,
			from: 'onboarding-with-email-verification',
		} );
	} );

	it( 'says nothing about where the signup came from otherwise', async () => {
		const body = await submitWith( {} );

		expect( body.extra ).toEqual( { has_segmentation_survey: false } );
	} );
} );

describe( 'blocked submit', () => {
	const mockStore = configureStore( [ thunk ] );

	// Records every create-account request so the assertions can tell "sent nothing" from "sent once".
	const renderBlocked = ( props ) => {
		const sent = [];
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/users/new', ( body ) => {
				sent.push( body );
				return true;
			} )
			.reply( 500, { error: 'internal_server_error' } )
			.persist();

		const view = render(
			<Provider store={ mockStore( {} ) }>
				<PasswordlessSignupForm flowName="onboarding" isSubmitBlocked { ...props } />
			</Provider>
		);

		fireEvent.change( screen.getByRole( 'textbox', { name: /email/i } ), {
			target: { value: 'test@example.com' },
		} );

		return { sent, view };
	};

	afterEach( () => nock.cleanAll() );

	it( 'disables the submit button while blocked', () => {
		renderBlocked();

		expect( screen.getByRole( 'button', { name: /create your account/i } ) ).toBeDisabled();
	} );

	it( 'sends no request when the disabled button is clicked', async () => {
		const { sent } = renderBlocked();

		fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );

		await waitFor( () => expect( sent ).toHaveLength( 0 ) );
	} );

	// The button being disabled doesn't stop Enter from submitting the form, so the guard has to sit
	// on the submit itself — this pins that.
	it( 'sends no request when Enter submits the form while blocked', async () => {
		const { sent } = renderBlocked();

		fireEvent.submit( screen.getByRole( 'textbox', { name: /email/i } ).closest( 'form' ) );

		await waitFor( () => expect( sent ).toHaveLength( 0 ) );
	} );

	it( 'creates the account with the activation source once unblocked', async () => {
		const { sent, view } = renderBlocked( {
			activationEmailFrom: 'onboarding-with-email-verification',
		} );

		view.rerender(
			<Provider store={ mockStore( {} ) }>
				<PasswordlessSignupForm
					flowName="onboarding"
					isSubmitBlocked={ false }
					activationEmailFrom="onboarding-with-email-verification"
				/>
			</Provider>
		);

		fireEvent.change( screen.getByRole( 'textbox', { name: /email/i } ), {
			target: { value: 'test@example.com' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );

		await waitFor( () => expect( sent ).toHaveLength( 1 ) );
		expect( sent[ 0 ].extra ).toEqual( {
			has_segmentation_survey: false,
			from: 'onboarding-with-email-verification',
		} );
	} );
} );

describe( 'email update mode', () => {
	const mockStore = configureStore( [ thunk ] );

	const renderWith = ( props ) =>
		render(
			<Provider store={ mockStore( {} ) }>
				<PasswordlessSignupForm
					secondaryFooterButton={ <button type="button">Go back</button> }
					{ ...props }
				/>
			</Provider>
		);

	const submit = async () => {
		fireEvent.change( screen.getByRole( 'textbox', { name: /email/i } ), {
			target: { value: 'test@example.com' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );
	};

	// A second typo while correcting the first is not a signup that failed, and the signup funnel
	// shouldn't carry it.
	it( 'records no signup failure when a correction is invalid', () => {
		const store = mockStore( {} );
		render(
			<Provider store={ store }>
				<PasswordlessSignupForm onUpdateEmail={ jest.fn() } />
			</Provider>
		);

		fireEvent.change( screen.getByRole( 'textbox', { name: /email/i } ), {
			target: { value: 'still-not-an-email' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );

		expect( screen.getByText( /valid email address/i ) ).toBeInTheDocument();
		expect( store.getActions() ).toHaveLength( 0 );
	} );

	// What this mode must not change: an ordinary signup keeps its way back while it waits.
	it( 'leaves an ordinary signup its way back while the account is being created', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/users/new' )
			.delay( 10000 )
			.reply( 200, {} );

		renderWith( {} );
		await submit();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: /creating your account/i } ) ).toBeDisabled()
		);
		expect( screen.getByRole( 'button', { name: 'Go back' } ) ).toBeEnabled();
		nock.cleanAll();
	} );
} );

describe( 'Blackbox integration', () => {
	const mockStore = configureStore( [ thunk ] );

	const renderFormAndSubmit = () => {
		const store = mockStore( {} );

		render(
			<Provider store={ store }>
				<PasswordlessSignupForm />
			</Provider>
		);

		const emailInput = screen.getByRole( 'textbox', { name: /email/i } );
		fireEvent.change( emailInput, { target: { value: 'test@example.com' } } );

		const submitButton = screen.getByRole( 'button', { name: /create your account/i } );
		fireEvent.click( submitButton );
	};

	const interceptUsersNew = ( status, responseBody ) => {
		let requestBody;
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/users/new', ( body ) => {
				requestBody = body;
				return true;
			} )
			.reply( status, responseBody );
		return () => requestBody;
	};

	afterEach( () => {
		// Restore the enabled baseline from config/test.json.
		config.enable( 'blackbox' );
		config.enable( 'blackbox-signup' );
		getBlackboxSessionId.mockReset();
		getBlackboxSessionId.mockResolvedValue( undefined );
		delete window.Blackbox;
		nock.cleanAll();
	} );

	it( 'attaches blackbox_session_id to the signup request when available', async () => {
		getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew( 403, { error: 'throttled' } );

		renderFormAndSubmit();

		await waitFor( () => expect( getRequestBody() ).toBeTruthy() );
		expect( getRequestBody().blackbox_session_id ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	it( 'omits blackbox_session_id when the signup feature flag is off', async () => {
		config.disable( 'blackbox-signup' );
		getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
		const getRequestBody = interceptUsersNew( 403, { error: 'throttled' } );

		renderFormAndSubmit();

		await waitFor( () => expect( getRequestBody() ).toBeTruthy() );
		expect( getRequestBody() ).not.toHaveProperty( 'blackbox_session_id' );
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	it( 'resets Blackbox when the signup request fails', async () => {
		window.Blackbox = { reset: jest.fn() };
		interceptUsersNew( 500, { error: 'internal_server_error' } );

		renderFormAndSubmit();

		await waitFor( () => expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 ) );
	} );

	describe( 'standalone form (no flow, parent-owned submit)', () => {
		const renderStandaloneFormAndSubmit = ( submitForm ) => {
			const store = mockStore( {} );

			render(
				<Provider store={ store }>
					<PasswordlessSignupForm flowName="" submitForm={ submitForm } />
				</Provider>
			);

			const emailInput = screen.getByRole( 'textbox', { name: /email/i } );
			fireEvent.change( emailInput, { target: { value: 'test@example.com' } } );

			fireEvent.click( screen.getByRole( 'button', { name: /create your account/i } ) );
		};

		it( 'attaches blackbox_session_id to the submitForm payload', async () => {
			getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
			const submitForm = jest.fn();

			renderStandaloneFormAndSubmit( submitForm );

			await waitFor( () => expect( submitForm ).toHaveBeenCalledTimes( 1 ) );
			expect( submitForm ).toHaveBeenCalledWith(
				expect.objectContaining( { blackbox_session_id: 'ABCDEFGHIJKLMNOPQRSTuv' } ),
				expect.any( Function )
			);
		} );

		it( 'omits blackbox_session_id when no session is available', async () => {
			getBlackboxSessionId.mockResolvedValue( undefined );
			const submitForm = jest.fn();

			renderStandaloneFormAndSubmit( submitForm );

			await waitFor( () => expect( submitForm ).toHaveBeenCalledTimes( 1 ) );
			expect( submitForm.mock.calls[ 0 ][ 0 ] ).not.toHaveProperty( 'blackbox_session_id' );
		} );

		it( 'resets Blackbox when the parent reports a submit error', async () => {
			window.Blackbox = { reset: jest.fn() };
			getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
			const submitForm = jest.fn();

			renderStandaloneFormAndSubmit( submitForm );
			await waitFor( () => expect( submitForm ).toHaveBeenCalledTimes( 1 ) );

			const afterSubmit = submitForm.mock.calls[ 0 ][ 1 ];
			afterSubmit( { error: 'email_exists' } );

			expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not reset Blackbox when the parent submit succeeds', async () => {
			window.Blackbox = { reset: jest.fn() };
			getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
			const submitForm = jest.fn();

			renderStandaloneFormAndSubmit( submitForm );
			await waitFor( () => expect( submitForm ).toHaveBeenCalledTimes( 1 ) );

			const afterSubmit = submitForm.mock.calls[ 0 ][ 1 ];
			afterSubmit();

			expect( window.Blackbox.reset ).not.toHaveBeenCalled();
		} );
	} );
} );
