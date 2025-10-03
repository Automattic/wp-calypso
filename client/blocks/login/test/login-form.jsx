/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import LoginForm from 'calypso/blocks/login/login-form';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'LoginForm', () => {
	test( 'displays a login form', async () => {
		render( <LoginForm socialAccountLink={ { isLinking: false } } /> );

		const username = screen.getByLabelText( /username/i );
		expect( username ).toBeInTheDocument();

		const password = screen.getByLabelText( /^password$/i );
		expect( password ).toBeInTheDocument();

		const btn = screen.getByRole( 'button', { name: /continue$/i } );
		expect( btn ).toBeInTheDocument();
	} );
} );
