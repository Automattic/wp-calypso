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

// Never settles, so the security key form stays in its waiting state.
jest.mock( 'calypso/state/login/actions/login-user-with-security-key', () => ( {
	loginUserWithSecurityKey: () => () => new Promise( () => {} ),
} ) );

const UNSUPPORTED_MESSAGE =
	'This browser doesn’t support passkeys or security keys. Try a different browser to log in with one.';

const renderContent = ( { supportedAuthTypes, isBrowserSupported, switchTwoFactorAuthType } ) => {
	mockIsWebAuthnSupported.mockReturnValue( isBrowserSupported );

	return renderWithProvider(
		<TwoFactorContent
			twoFactorAuthType="webauthn"
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
} );
