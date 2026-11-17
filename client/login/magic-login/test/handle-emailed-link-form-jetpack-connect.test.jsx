/** @jest-environment jsdom */
import page from '@automattic/calypso-router';
import { waitFor } from '@testing-library/react';
import { LoginContext } from 'calypso/login/login-context';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import HandleEmailedLinkFormJetpackConnect from '../handle-emailed-link-form-jetpack-connect';

const mockIsWebAuthnSupported = jest.fn();

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '../emailed-login-link-expired', () => () => null );
jest.mock( 'calypso/lib/webauthn', () => ( {
	...jest.requireActual( 'calypso/lib/webauthn' ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

// Answers the magic link authenticate request with a two-step challenge, as the
// endpoint does for an account with two-step authentication.
const respondWithTwoStepChallenge = ( twoStepData ) => {
	globalThis.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( {
			success: true,
			data: {
				user_id: 123,
				two_step_notification_sent: 'none',
				...twoStepData,
			},
		} ),
	} );
};

const renderForm = () =>
	renderWithProvider(
		<LoginContext.Provider value={ { setHeaders: jest.fn() } }>
			<HandleEmailedLinkFormJetpackConnect emailAddress="user@example.com" token="a-token" />
		</LoginContext.Provider>,
		{ reducers: { login: loginReducer } }
	);

describe( 'HandleEmailedLinkFormJetpackConnect 2FA handoff', () => {
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		jest.clearAllMocks();
		mockIsWebAuthnSupported.mockReturnValue( false );
	} );

	afterEach( () => {
		globalThis.fetch = originalFetch;
	} );

	it( 'routes a passkey account to the security key prompt when the browser supports WebAuthn', async () => {
		mockIsWebAuthnSupported.mockReturnValue( true );
		respondWithTwoStepChallenge( {
			two_step_supported_auth_types: [ 'webauthn', 'authenticator', 'backup' ],
		} );

		renderForm();

		await waitFor( () => expect( page ).toHaveBeenCalledWith( '/log-in/jetpack/webauthn' ) );
	} );

	it( 'routes a passkey account without an authenticator app to the backup code prompt when the browser lacks WebAuthn', async () => {
		respondWithTwoStepChallenge( {
			two_step_supported_auth_types: [ 'webauthn', 'backup' ],
		} );

		renderForm();

		await waitFor( () => expect( page ).toHaveBeenCalledWith( '/log-in/jetpack/backup' ) );
	} );
} );
