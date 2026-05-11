/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import TwoFactorActions from 'calypso/blocks/login/two-factor-authentication/two-factor-actions';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

const stateWith = ( { types = [ 'webauthn' ], query = {}, redirectTo = undefined } = {} ) => ( {
	login: {
		twoFactorAuth: { two_step_supported_auth_types: types },
		redirectTo: { original: redirectTo },
	},
	route: { query: { current: query } },
} );

describe( 'TwoFactorActions', () => {
	beforeEach( () => {
		page.mockClear();
	} );

	test( 'renders alternate-method buttons when API surfaces other factors', () => {
		render(
			<TwoFactorActions twoFactorAuthType="webauthn" switchTwoFactorAuthType={ () => {} } />,
			{ initialState: stateWith( { types: [ 'webauthn', 'authenticator', 'backup' ] } ) }
		);

		expect( screen.getByRole( 'button', { name: /Use authenticator/i } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Use a backup code instead/i } ) ).toBeVisible();
	} );

	test( 'renders fallback "Sign in another way" on webauthn screen when no other factors are surfaced', () => {
		render(
			<TwoFactorActions twoFactorAuthType="webauthn" switchTwoFactorAuthType={ () => {} } />,
			{ initialState: stateWith( { types: [ 'webauthn' ] } ) }
		);

		expect( screen.getByRole( 'button', { name: /Sign in another way/i } ) ).toBeVisible();
	} );

	test( 'renders nothing on non-webauthn screens when no other factors are surfaced', () => {
		const { container } = render(
			<TwoFactorActions twoFactorAuthType="authenticator" switchTwoFactorAuthType={ () => {} } />,
			{ initialState: stateWith( { types: [ 'authenticator' ] } ) }
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'fallback navigates to /log-in preserving redirect_to, from, and signup_url', async () => {
		const user = userEvent.setup();
		render(
			<TwoFactorActions twoFactorAuthType="webauthn" switchTwoFactorAuthType={ () => {} } />,
			{
				initialState: stateWith( {
					types: [ 'webauthn' ],
					redirectTo: 'https://wordpress.com/me?from=jetpack-cloud',
					query: { from: 'jetpack-cloud', signup_url: '/start' },
				} ),
			}
		);

		await user.click( screen.getByRole( 'button', { name: /Sign in another way/i } ) );

		expect( page ).toHaveBeenCalledTimes( 1 );
		const calledWith = page.mock.calls[ 0 ][ 0 ];
		expect( calledWith ).toMatch( /^\/log-in(\?|$)/ );
		expect( calledWith ).toContain(
			'redirect_to=https%3A%2F%2Fwordpress.com%2Fme%3Ffrom%3Djetpack-cloud'
		);
		expect( calledWith ).toContain( 'from=jetpack-cloud' );
		expect( calledWith ).toContain( 'signup_url=%2Fstart' );
	} );
} );
