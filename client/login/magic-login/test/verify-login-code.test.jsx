/** @jest-environment jsdom */
import page from '@automattic/calypso-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18N, I18NContext } from 'i18n-calypso';
import { navigate } from 'calypso/lib/navigate';
import { LoginContext } from 'calypso/login/login-context';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import VerifyLoginCode from '../verify-login-code';

const mockIsWebAuthnSupported = jest.fn();

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/lib/navigate', () => ( { navigate: jest.fn() } ) );
jest.mock( 'calypso/lib/webauthn', () => ( {
	...jest.requireActual( 'calypso/lib/webauthn' ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

const REDIRECT_TO = 'https://wordpress.com/jetpack/connect/authorize?client_id=123';

// Answers the magic code authenticate request the way the endpoint does.
const respondWith = ( data ) => {
	globalThis.fetch = jest.fn().mockResolvedValue( {
		ok: true,
		json: async () => ( { success: true, data } ),
	} );
};

// The endpoint answers a two-step account with a challenge instead of logging it in.
const respondWithTwoStepChallenge = ( twoStepData ) =>
	respondWith( {
		redirect_to: REDIRECT_TO,
		user_id: 123,
		two_step_notification_sent: 'none',
		...twoStepData,
	} );

const submitCode = async ( { localeSlug = 'en' } = {} ) => {
	const i18n = new I18N();
	i18n.setLocale( { '': { localeSlug } } );

	renderWithProvider(
		<I18NContext.Provider value={ i18n }>
			<LoginContext.Provider value={ { setHeaders: jest.fn() } }>
				<VerifyLoginCode publicToken="public-token" usernameOrEmail="user@example.com" />
			</LoginContext.Provider>
		</I18NContext.Provider>,
		{ reducers: { login: loginReducer } }
	);

	const user = userEvent.setup();
	await user.click( screen.getByLabelText( 'Verification code character 1 of 6' ) );
	await user.keyboard( '123456' );
	await user.click( screen.getByRole( 'button', { name: 'Verify code' } ) );
};

describe( 'VerifyLoginCode', () => {
	const originalFetch = globalThis.fetch;

	beforeEach( () => {
		jest.clearAllMocks();
		mockIsWebAuthnSupported.mockReturnValue( false );
	} );

	afterEach( () => {
		globalThis.fetch = originalFetch;
	} );

	it( 'sends an account without two-step authentication to the redirect URL', async () => {
		respondWith( { redirect_to: REDIRECT_TO } );

		await submitCode();

		await waitFor( () => expect( navigate ).toHaveBeenCalledWith( REDIRECT_TO ) );
		expect( page ).not.toHaveBeenCalled();
	} );

	it( 'routes a passkey account to the security key prompt when the browser supports WebAuthn', async () => {
		mockIsWebAuthnSupported.mockReturnValue( true );
		respondWithTwoStepChallenge( {
			two_step_supported_auth_types: [ 'webauthn', 'authenticator', 'backup' ],
		} );

		await submitCode();

		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith(
				`/log-in/jetpack/webauthn?redirect_to=${ encodeURIComponent( REDIRECT_TO ) }`
			)
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'routes a passkey account without an authenticator app to the backup code prompt when the browser lacks WebAuthn', async () => {
		respondWithTwoStepChallenge( {
			two_step_supported_auth_types: [ 'webauthn', 'backup' ],
		} );

		await submitCode();

		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith(
				`/log-in/jetpack/backup?redirect_to=${ encodeURIComponent( REDIRECT_TO ) }`
			)
		);
		expect( navigate ).not.toHaveBeenCalled();
	} );

	it( 'keeps the active locale in the second-factor URL', async () => {
		respondWithTwoStepChallenge( {
			two_step_supported_auth_types: [ 'webauthn', 'backup' ],
		} );

		await submitCode( { localeSlug: 'fr' } );

		await waitFor( () =>
			expect( page ).toHaveBeenCalledWith(
				`/log-in/jetpack/backup/fr?redirect_to=${ encodeURIComponent( REDIRECT_TO ) }`
			)
		);
	} );
} );
