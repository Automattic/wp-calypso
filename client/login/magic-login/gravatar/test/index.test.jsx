/** @jest-environment jsdom */
import page from '@automattic/calypso-router';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { GravPoweredEmailCodeVerification } from '..';

const mockIsWebAuthnSupported = jest.fn();

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( 'calypso/lib/webauthn', () => ( {
	...jest.requireActual( 'calypso/lib/webauthn' ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

const baseProps = {
	locale: 'en',
	oauth2Client: { id: 1854, title: 'Gravatar' },
	oauth2ClientId: 1854,
	isGravatarFlow: false,
	isGravatarOwnedService: true,
	isFromGravatar3rdPartyApp: false,
	usernameOrEmail: 'user@example.com',
	maskedEmailAddress: '',
	isSecondaryEmail: false,
	isNewAccount: false,
	verificationCodeInputValue: '123456',
	handleGravPoweredCodeInputChange: jest.fn(),
	handleGravPoweredCodeSubmit: jest.fn(),
	handleGravPoweredEmailCodeSend: jest.fn(),
	resendEmailCountdown: 0,
	isRequestingEmail: false,
	shouldShowSwitchEmail: true,
	resetResendEmailCountdown: jest.fn(),
	handleGravPoweredEmailSwitch: jest.fn(),
	recordTracksEvent: jest.fn(),
};

// The state once the code is accepted for an account with two-step authentication.
const renderAfterCodeAccepted = ( twoFactorAuth ) =>
	renderWithProvider( <GravPoweredEmailCodeVerification { ...baseProps } />, {
		reducers: { login: loginReducer },
		initialState: {
			login: {
				magicLogin: { requestAuthSuccess: true },
				twoFactorAuth: { two_step_notification_sent: 'none', ...twoFactorAuth },
			},
		},
	} );

describe( 'GravPoweredEmailCodeVerification 2FA handoff', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsWebAuthnSupported.mockReturnValue( false );
	} );

	it( 'routes a passkey account to the security key prompt when the browser supports WebAuthn', () => {
		mockIsWebAuthnSupported.mockReturnValue( true );

		renderAfterCodeAccepted( {
			two_step_supported_auth_types: [ 'webauthn', 'authenticator', 'backup' ],
		} );

		expect( page ).toHaveBeenCalledWith( '/log-in/webauthn?client_id=1854' );
	} );

	it( 'routes a passkey account without an authenticator app to the backup code prompt when the browser lacks WebAuthn', () => {
		renderAfterCodeAccepted( {
			two_step_supported_auth_types: [ 'webauthn', 'backup' ],
		} );

		expect( page ).toHaveBeenCalledWith( '/log-in/backup?client_id=1854' );
	} );
} );
