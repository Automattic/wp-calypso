/**
 * @jest-environment jsdom
 */
import Login from 'calypso/blocks/login';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const mockIsWebAuthnSupported = jest.fn();

jest.mock( 'calypso/lib/webauthn', () => ( {
	...jest.requireActual( 'calypso/lib/webauthn' ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

// Stands in for a successful password step, which is when the two-step method is chosen.
jest.mock( 'calypso/blocks/login/login-form', () => {
	const { useEffect } = jest.requireActual( 'react' );
	return ( { onSuccess } ) => {
		useEffect( () => {
			onSuccess();
		}, [ onSuccess ] );
		return null;
	};
} );

const renderPasswordStepSuccess = ( { supportedAuthTypes, isBrowserSupported } ) => {
	mockIsWebAuthnSupported.mockReturnValue( isBrowserSupported );
	const onTwoFactorRequested = jest.fn();

	renderWithProvider( <Login onTwoFactorRequested={ onTwoFactorRequested } />, {
		reducers: { login: loginReducer },
		initialState: {
			login: {
				twoFactorAuth: {
					user_id: 123456,
					two_step_supported_auth_types: supportedAuthTypes,
					two_step_notification_sent: 'none',
				},
			},
		},
	} );

	return onTwoFactorRequested;
};

describe( 'Login default two-step method', () => {
	beforeEach( () => {
		// jsdom doesn't implement window.scrollTo; the login block calls it on mount.
		window.scrollTo = jest.fn();
	} );

	test.each( [
		[ [ 'webauthn', 'backup' ], false, 'backup' ],
		[ [ 'webauthn' ], false, 'webauthn' ],
		[ [ 'webauthn', 'backup', 'authenticator' ], false, 'authenticator' ],
		[ [ 'webauthn', 'backup' ], true, 'webauthn' ],
	] )(
		'with %j advertised and WebAuthn support %s, asks for %s',
		( supportedAuthTypes, isBrowserSupported, expected ) => {
			const onTwoFactorRequested = renderPasswordStepSuccess( {
				supportedAuthTypes,
				isBrowserSupported,
			} );

			expect( onTwoFactorRequested ).toHaveBeenCalledWith( expected );
		}
	);
} );
