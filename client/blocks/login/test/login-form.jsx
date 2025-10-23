/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cookie from 'cookie';
import LoginForm from 'calypso/blocks/login/login-form';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'cookie', () => ( {
	parse: jest.fn( () => ( { last_used_authentication_method: '' } ) ),
	serialize: jest.fn(),
} ) );

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

	test( 'displays notice when social account is linking', async () => {
		render( <LoginForm />, {
			initialState: { login: { socialAccountLink: { isLinking: true } } },
		} );

		const notice = screen.getByText( /We found a WordPress.com account with the email address/i );
		expect( notice ).toBeInTheDocument();
	} );

	test( 'displays notice when social account is linking and last used authentication method is set', async () => {
		cookie.parse.mockImplementationOnce( () => ( { last_used_authentication_method: 'google' } ) );

		render( <LoginForm isSocialFirst />, {
			initialState: { login: { socialAccountLink: { isLinking: true } } },
		} );

		const notice = screen.getByText( /We found a WordPress.com account with the email address/i );
		expect( notice ).toBeInTheDocument();
	} );

	test( 'hides the notice when username input is changed', async () => {
		render( <LoginForm />, {
			initialState: { login: { socialAccountLink: { isLinking: true } } },
		} );

		const username = screen.getByLabelText( /username/i );
		await userEvent.type( username, 'test@example.com' );

		const notice = screen.queryByText( /We found a WordPress.com account with the email address/i );
		expect( notice ).not.toBeInTheDocument();
	} );

	test( 'shows the last used authentication method when `isSocialFirst` is true', async () => {
		cookie.parse.mockImplementationOnce( () => ( { last_used_authentication_method: 'google' } ) );

		render( <LoginForm isSocialFirst /> );

		const previous = screen.getByText( /Previously used/i );
		expect( previous ).toBeInTheDocument();

		const google = screen.getByText( /Continue with Google/i );
		expect( google ).toBeInTheDocument();
	} );

	test( 'resets the last used authentication method to using password when social account is linking', async () => {
		cookie.parse.mockImplementationOnce( () => ( { last_used_authentication_method: 'google' } ) );

		render( <LoginForm isSocialFirst />, {
			initialState: { login: { socialAccountLink: { isLinking: true } } },
		} );

		const previous = screen.queryByText( /Previously used/i );
		expect( previous ).not.toBeInTheDocument();

		const google = screen.queryByText( /Continue with Google/i );
		expect( google ).not.toBeInTheDocument();

		const username = screen.getByLabelText( /username/i );
		expect( username ).toBeInTheDocument();

		const password = screen.getByLabelText( /^password$/i );
		expect( password ).toBeInTheDocument();

		const btn = screen.getByRole( 'button', { name: /Log In/i } );
		expect( btn ).toBeInTheDocument();
	} );

	test( 'shows the password field for regular accounts', async () => {
		const { container } = render( <LoginForm isSocialFirst />, {
			initialState: {
				login: { authAccountType: 'regular' },
			},
		} );

		const passwordContainer = container.getElementsByClassName( 'login__form-password' )[ 0 ];
		expect( passwordContainer ).not.toHaveClass( 'is-hidden' );
	} );

	test( 'hides the password field for passwordless accounts', async () => {
		const { container } = render( <LoginForm isSocialFirst />, {
			initialState: {
				login: { authAccountType: 'passwordless' },
			},
		} );

		const passwordContainer = container.getElementsByClassName( 'login__form-password' )[ 0 ];
		expect( passwordContainer ).toHaveClass( 'is-hidden' );
	} );

	test( 'shows "Continue" button text for passwordless accounts', async () => {
		render( <LoginForm isSocialFirst />, {
			initialState: {
				login: { authAccountType: 'passwordless' },
			},
		} );

		const btn = screen.getByRole( 'button', { name: /^Continue$/i } );
		expect( btn ).toBeInTheDocument();
	} );

	test( 'shows "Log In" button text for regular accounts', async () => {
		render( <LoginForm isSocialFirst />, {
			initialState: {
				login: { authAccountType: 'regular' },
			},
		} );

		const btn = screen.getByRole( 'button', { name: /Log In/i } );
		expect( btn ).toBeInTheDocument();
	} );
} );
