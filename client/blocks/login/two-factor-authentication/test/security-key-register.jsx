/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecurityKeyRegister from 'calypso/blocks/login/two-factor-authentication/security-key-register';
import { isWebAuthnSupported, registerSecurityKey } from 'calypso/lib/webauthn';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/lib/webauthn', () => ( {
	isWebAuthnSupported: jest.fn( () => true ),
	registerSecurityKey: jest.fn(),
} ) );

const render = ( el ) => renderWithProvider( el, { reducers: { login: loginReducer } } );

describe( 'SecurityKeyRegister', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		isWebAuthnSupported.mockReturnValue( true );
	} );

	test( 'renders the registration form', () => {
		render( <SecurityKeyRegister onFinish={ jest.fn() } /> );

		expect( screen.getByRole( 'heading', { name: 'Register a new security key' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Register security key' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Skip for now' } ) ).toBeVisible();
	} );

	test( 'renders nothing when WebAuthn is unsupported', () => {
		isWebAuthnSupported.mockReturnValue( false );
		const { container } = render( <SecurityKeyRegister onFinish={ jest.fn() } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'registers the key with the entered name and finishes on success', async () => {
		const user = userEvent.setup();
		registerSecurityKey.mockResolvedValue( {} );
		const onFinish = jest.fn();

		render( <SecurityKeyRegister onFinish={ onFinish } /> );

		await user.type( screen.getByRole( 'textbox' ), 'My laptop' );
		await user.click( screen.getByRole( 'button', { name: 'Register security key' } ) );

		await waitFor( () => expect( onFinish ).toHaveBeenCalled() );
		expect( registerSecurityKey ).toHaveBeenCalledWith( 'My laptop' );
	} );

	test( 'skips (finishes without registering) when "Skip for now" is clicked', async () => {
		const user = userEvent.setup();
		const onFinish = jest.fn();

		render( <SecurityKeyRegister onFinish={ onFinish } /> );

		await user.click( screen.getByRole( 'button', { name: 'Skip for now' } ) );

		expect( onFinish ).toHaveBeenCalled();
		expect( registerSecurityKey ).not.toHaveBeenCalled();
	} );

	test( 'shows an error and does not finish when registration fails', async () => {
		const user = userEvent.setup();
		registerSecurityKey.mockRejectedValue( { message: 'Security key interaction canceled.' } );
		const onFinish = jest.fn();

		render( <SecurityKeyRegister onFinish={ onFinish } /> );

		await user.click( screen.getByRole( 'button', { name: 'Register security key' } ) );

		expect( await screen.findByText( 'Security key interaction canceled.' ) ).toBeVisible();
		expect( onFinish ).not.toHaveBeenCalled();
	} );
} );
