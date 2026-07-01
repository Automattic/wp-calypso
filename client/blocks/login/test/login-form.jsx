/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import cookie from 'cookie';
import LoginForm from 'calypso/blocks/login/login-form';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import loginReducer from 'calypso/state/login/reducer';
import routeReducer from 'calypso/state/route/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'cookie', () => ( {
	parse: jest.fn( () => ( { last_used_authentication_method: '' } ) ),
	serialize: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( 'calypso/blocks/login/blackbox-challenge', () => {
	const { useEffect } = require( 'react' );
	return ( { onSubmitBlockedChange } ) => {
		useEffect( () => onSubmitBlockedChange?.( false ), [ onSubmitBlockedChange ] );
		return null;
	};
} );

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { login: loginReducer, route: routeReducer } } );

describe( 'LoginForm', () => {
	// Blackbox is enabled in the test config; turn it off so these tests don't load the SDK.
	beforeAll( () => config.disable( 'blackbox' ) );

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

		const { container } = render( <LoginForm isSocialFirst /> );

		const badge = screen.getByText( /Last used/i );
		expect( badge ).toBeInTheDocument();

		const google = screen.getByText( /Continue with Google/i );
		expect( google ).toBeInTheDocument();

		const wrapper = container.querySelector( '.social-buttons__last-used' );
		expect( wrapper ).toContainElement( google.closest( 'button' ) );
	} );

	test( 'shows the Last used badge next to the email label when cookie is password', async () => {
		cookie.parse.mockImplementationOnce( () => ( {
			last_used_authentication_method: 'password',
		} ) );

		const { container } = render( <LoginForm isSocialFirst /> );

		const badge = screen.getByText( /Last used/i );
		expect( badge ).toBeInTheDocument();

		const label = container.querySelector( '.form-label.has-last-used-badge' );
		expect( label ).toBeInTheDocument();
		expect( label ).toContainElement( badge );
	} );

	test( 'honours the ?last_used= query-param override in non-production', async () => {
		// Cookie is empty — the badge can only appear via the dev-only query override.
		const { container } = render( <LoginForm isSocialFirst />, {
			initialState: {
				route: {
					query: {
						current: { last_used: 'google' },
						initial: {},
					},
				},
			},
		} );

		const badge = screen.getByText( /Last used/i );
		expect( badge ).toBeInTheDocument();

		const google = screen.getByText( /Continue with Google/i );
		expect( google ).toBeInTheDocument();

		const wrapper = container.querySelector( '.social-buttons__last-used' );
		expect( wrapper ).toContainElement( google.closest( 'button' ) );
	} );

	test( 'shows the password form alongside the last used badge when social account is linking', async () => {
		cookie.parse.mockImplementationOnce( () => ( { last_used_authentication_method: 'google' } ) );

		render( <LoginForm isSocialFirst />, {
			initialState: { login: { socialAccountLink: { isLinking: true } } },
		} );

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

	test( 'shows the visual email-or-username label for Jetpack logins', async () => {
		render( <LoginForm isJetpack />, {
			initialState: {
				login: { socialAccountLink: { isLinking: false } },
				route: { query: { current: {}, initial: {} } },
			},
		} );

		const label = screen.getByText( 'Email address or username', {
			selector: 'span[aria-hidden="true"]',
		} );
		expect( label ).toBeInTheDocument();
	} );

	test( 'shows the default "Continue" button text for Jetpack logins', async () => {
		render( <LoginForm isJetpack />, {
			initialState: {
				login: { socialAccountLink: { isLinking: false } },
				route: { query: { current: {}, initial: {} } },
			},
		} );

		const btn = screen.getByRole( 'button', { name: /^Continue$/i } );
		expect( btn ).toBeInTheDocument();
	} );

	test( 'shows the username-only label when query flag is set', async () => {
		render( <LoginForm />, {
			initialState: {
				route: {
					query: {
						current: { username_only: 'true' },
						initial: {},
					},
				},
			},
		} );

		expect( screen.getByText( 'Your username' ) ).toBeInTheDocument();
	} );

	describe( 'Blackbox integration', () => {
		const mockFetch = jest.fn();

		// authAccountType 'regular' puts the form in password view so submitting
		// dispatches loginUser() directly (no account-type round-trip).
		const renderRegularLoginForm = () =>
			render( <LoginForm isSocialFirst onSuccess={ jest.fn() } redirectTo="" />, {
				initialState: { login: { authAccountType: 'regular' } },
			} );

		beforeEach( () => {
			config.enable( 'blackbox' );
			config.enable( 'blackbox-login' );
			window.fetch = mockFetch;
		} );

		afterEach( () => {
			// Restore the suite-wide baseline (Blackbox off).
			config.disable( 'blackbox' );
			mockFetch.mockReset();
			getBlackboxSessionId.mockReset();
			getBlackboxSessionId.mockResolvedValue( undefined );
			delete window.Blackbox;
		} );

		test( 'attaches blackbox_session_id to the login request when available', async () => {
			getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( { data: { two_step_notification_sent: 'app' } } ),
			} );

			renderRegularLoginForm();
			await userEvent.click( screen.getByRole( 'button', { name: /Log In/i } ) );

			await waitFor( () => expect( mockFetch ).toHaveBeenCalled() );

			const body = new URLSearchParams( mockFetch.mock.calls[ 0 ][ 1 ].body );
			expect( body.get( 'blackbox_session_id' ) ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
		} );

		test( 'omits blackbox_session_id when the login feature flag is off', async () => {
			config.disable( 'blackbox-login' );
			getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );
			mockFetch.mockResolvedValueOnce( {
				ok: true,
				json: jest.fn().mockResolvedValue( { data: { two_step_notification_sent: 'app' } } ),
			} );

			renderRegularLoginForm();
			await userEvent.click( screen.getByRole( 'button', { name: /Log In/i } ) );

			await waitFor( () => expect( mockFetch ).toHaveBeenCalled() );

			const body = new URLSearchParams( mockFetch.mock.calls[ 0 ][ 1 ].body );
			expect( body.has( 'blackbox_session_id' ) ).toBe( false );
			expect( getBlackboxSessionId ).not.toHaveBeenCalled();
		} );

		test( 'resets Blackbox when the login request fails', async () => {
			window.Blackbox = { reset: jest.fn() };
			mockFetch.mockResolvedValueOnce( {
				ok: false,
				status: 400,
				text: jest.fn().mockResolvedValue( '' ),
			} );

			renderRegularLoginForm();
			await userEvent.click( screen.getByRole( 'button', { name: /Log In/i } ) );

			await waitFor( () => expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 ) );
		} );
	} );
} );
