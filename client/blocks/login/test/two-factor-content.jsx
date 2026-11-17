/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFactorContent from 'calypso/blocks/login/two-factor-authentication/two-factor-content';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const mockIsWebAuthnSupported = jest.fn();

jest.mock( 'calypso/lib/webauthn', () => ( {
	...jest.requireActual( 'calypso/lib/webauthn' ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

const mockLoginUserWithSecurityKey = jest.fn();

jest.mock( 'calypso/state/login/actions/login-user-with-security-key', () => ( {
	loginUserWithSecurityKey: () => () => mockLoginUserWithSecurityKey(),
} ) );

beforeEach( () => {
	// Never settles, so the security key form stays in its waiting state.
	mockLoginUserWithSecurityKey.mockImplementation( () => new Promise( () => {} ) );
} );

const UNSUPPORTED_MESSAGE =
	'This browser doesn’t support passkeys or security keys. Try a different browser to log in with one.';
const ENHANCED_SECURITY_MESSAGE =
	'Enhanced account security is on, so you need a passkey or security key to log in.';
const USE_BACKUP_CODE_MESSAGE =
	'This browser doesn’t support passkeys or security keys, so use a backup code instead.';

const renderContent = ( {
	supportedAuthTypes,
	isBrowserSupported,
	switchTwoFactorAuthType,
	twoFactorAuthType = 'webauthn',
} ) => {
	mockIsWebAuthnSupported.mockReturnValue( isBrowserSupported );

	return renderWithProvider(
		<TwoFactorContent
			twoFactorAuthType={ twoFactorAuthType }
			twoFactorNotificationSent="none"
			isBrowserSupported={ isBrowserSupported }
			handleValid2FACode={ () => {} }
			rebootAfterLogin={ () => {} }
			switchTwoFactorAuthType={ switchTwoFactorAuthType ?? ( () => {} ) }
		/>,
		{
			reducers: { login: loginReducer },
			initialState: {
				login: { twoFactorAuth: { two_step_supported_auth_types: supportedAuthTypes } },
			},
		}
	);
};

describe( 'TwoFactorContent', () => {
	describe( 'on the security key step in a browser without WebAuthn', () => {
		test( 'explains why the user cannot continue when no other method is advertised', () => {
			renderContent( { supportedAuthTypes: [ 'webauthn' ], isBrowserSupported: false } );

			expect( screen.getByText( ENHANCED_SECURITY_MESSAGE ) ).toBeVisible();
			expect( screen.getByText( UNSUPPORTED_MESSAGE ) ).toBeVisible();
			expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		} );

		test( 'offers the other advertised methods', async () => {
			const switchTwoFactorAuthType = jest.fn();
			renderContent( {
				supportedAuthTypes: [ 'webauthn', 'sms', 'backup' ],
				isBrowserSupported: false,
				switchTwoFactorAuthType,
			} );

			expect( screen.getByText( UNSUPPORTED_MESSAGE ) ).toBeVisible();
			expect( screen.queryByText( ENHANCED_SECURITY_MESSAGE ) ).not.toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { name: 'Send code via\u00A0text\u00A0message' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'Continue with your security\u00A0key' } )
			).not.toBeInTheDocument();

			await userEvent.click( screen.getByRole( 'button', { name: 'Use a backup code instead' } ) );

			expect( switchTwoFactorAuthType ).toHaveBeenCalledWith( 'backup' );
		} );
	} );

	test( 'shows the security key form when the browser supports WebAuthn', () => {
		renderContent( { supportedAuthTypes: [ 'webauthn', 'backup' ], isBrowserSupported: true } );

		expect( screen.getByRole( 'button', { name: 'Continue with security key' } ) ).toBeVisible();
		expect( screen.queryByText( UNSUPPORTED_MESSAGE ) ).not.toBeInTheDocument();
	} );

	describe( 'with enhanced account security', () => {
		test( 'says why the security key form asks for a passkey', () => {
			renderContent( { supportedAuthTypes: [ 'webauthn', 'backup' ], isBrowserSupported: true } );

			expect( screen.getByText( 'Waiting for security key' ) ).toBeVisible();
			expect( screen.getByText( ENHANCED_SECURITY_MESSAGE ) ).toBeVisible();
		} );

		test( 'still says why after the passkey prompt fails', async () => {
			mockLoginUserWithSecurityKey.mockRejectedValueOnce( new Error( 'The prompt timed out' ) );
			renderContent( { supportedAuthTypes: [ 'webauthn', 'backup' ], isBrowserSupported: true } );

			expect(
				await screen.findByText( 'Use your security key to finish logging in.' )
			).toBeVisible();
			expect( screen.getByText( ENHANCED_SECURITY_MESSAGE ) ).toBeVisible();
		} );

		test( 'says why the backup code form opened when the browser lacks WebAuthn', () => {
			renderContent( {
				supportedAuthTypes: [ 'webauthn', 'backup' ],
				isBrowserSupported: false,
				twoFactorAuthType: 'backup',
			} );

			expect( screen.getByText( ENHANCED_SECURITY_MESSAGE, { exact: false } ) ).toBeVisible();
			expect( screen.getByText( USE_BACKUP_CODE_MESSAGE, { exact: false } ) ).toBeVisible();
		} );

		test( 'adds nothing to the backup code form when the user picked it in a supported browser', () => {
			renderContent( {
				supportedAuthTypes: [ 'webauthn', 'backup' ],
				isBrowserSupported: true,
				twoFactorAuthType: 'backup',
			} );

			expect(
				screen.queryByText( ENHANCED_SECURITY_MESSAGE, { exact: false } )
			).not.toBeInTheDocument();
		} );
	} );

	test( 'does not mention enhanced security when the account allows other methods', () => {
		renderContent( {
			supportedAuthTypes: [ 'backup', 'authenticator', 'webauthn' ],
			isBrowserSupported: true,
		} );

		expect( screen.queryByText( ENHANCED_SECURITY_MESSAGE ) ).not.toBeInTheDocument();
	} );
} );
