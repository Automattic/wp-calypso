/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import TwoFactorActions from 'calypso/blocks/login/two-factor-authentication/two-factor-actions';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

const stateWithSupportedTypes = ( types ) => ( {
	login: {
		twoFactorAuth: { two_step_supported_auth_types: types },
	},
} );

describe( 'TwoFactorActions', () => {
	test( 'renders alternate-method buttons when API surfaces other factors', () => {
		render(
			<TwoFactorActions twoFactorAuthType="webauthn" switchTwoFactorAuthType={ () => {} } />,
			{
				initialState: stateWithSupportedTypes( [ 'webauthn', 'authenticator', 'backup' ] ),
			}
		);

		expect( screen.getByRole( 'button', { name: /Use authenticator/i } ) ).toBeInTheDocument();
		expect(
			screen.getByRole( 'button', { name: /Use a backup code instead/i } )
		).toBeInTheDocument();
	} );

	test( 'renders fallback "Sign in another way" on webauthn screen when no other factors are surfaced', () => {
		render(
			<TwoFactorActions twoFactorAuthType="webauthn" switchTwoFactorAuthType={ () => {} } />,
			{
				initialState: stateWithSupportedTypes( [ 'webauthn' ] ),
			}
		);

		expect( screen.getByRole( 'button', { name: /Sign in another way/i } ) ).toBeInTheDocument();
	} );

	test( 'renders nothing on non-webauthn screens when no other factors are surfaced', () => {
		const { container } = render(
			<TwoFactorActions twoFactorAuthType="authenticator" switchTwoFactorAuthType={ () => {} } />,
			{ initialState: stateWithSupportedTypes( [ 'authenticator' ] ) }
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );
