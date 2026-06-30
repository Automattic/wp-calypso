/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LostPasswordForm from 'calypso/blocks/login/lost-password-form';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
} ) );

jest.mock( 'calypso/blocks/login/utils/get-blackbox-session-id', () => ( {
	getBlackboxSessionId: jest.fn().mockResolvedValue( undefined ),
} ) );

jest.mock( 'calypso/blocks/login/blackbox-challenge', () => {
	const { useEffect } = require( 'react' );
	// Stand-in widget that reports "not blocking" so an enabled form stays submittable.
	return ( { onSubmitBlockedChange } ) => {
		useEffect( () => onSubmitBlockedChange?.( false ), [ onSubmitBlockedChange ] );
		return null;
	};
} );

const mockFetch = jest.fn();
global.fetch = mockFetch;

Object.defineProperty( window, 'location', {
	value: {
		origin: 'https://example.com',
	},
} );

describe( 'LostPasswordForm', () => {
	afterEach( () => {
		mockFetch.mockClear();
		// Restore the flags to the enabled baseline from config/test.json.
		config.enable( 'blackbox' );
		config.enable( 'blackbox-lost-password' );
		getBlackboxSessionId.mockClear();
		getBlackboxSessionId.mockResolvedValue( undefined );
		delete window.Blackbox;
	} );

	test( 'displays a lost password form without errors', () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		const userLogin = screen.getByLabelText( /Email address or username/i );
		expect( userLogin ).toBeInTheDocument();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeInTheDocument();
		expect( btn ).toBeDisabled();

		expect( screen.queryByRole( 'alert' ) ).toBeNull();
	} );

	test( 'displays an error message when email is invalid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'invalid@email'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.getByRole( 'alert' ) ).toBeInTheDocument();
		} );

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeDisabled();
	} );

	test( 'enable submit button when email is valid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeEnabled();
	} );

	test( 'reset error message when email is valid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'invalid@email'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await userEvent.clear( screen.getByRole( 'textbox', { name: 'Email address or username' } ) );
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.queryByRole( 'alert' ) ).toBeNull();
		} );
	} );

	test( 'reset error message when input is empty', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'invalid@email'
		);
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await userEvent.clear( screen.getByRole( 'textbox', { name: 'Email address or username' } ) );
		// The error message is displayed after the user blurs the input.
		userEvent.tab();

		await waitFor( () => {
			expect( screen.queryByRole( 'alert' ) ).toBeNull();
		} );
	} );

	test( 'enable submit button when username is valid', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'validusername'
		);
		// The validation happens after the user blurs the input.
		userEvent.tab();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeEnabled();
	} );

	test( 'enable submit button when short username is entered', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'ab'
		);
		// The validation happens after the user blurs the input.
		userEvent.tab();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeEnabled();
		expect( screen.queryByRole( 'alert' ) ).toBeNull();
	} );

	test( 'enable submit button when username with special characters is entered', async () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user123'
		);
		// The validation happens after the user blurs the input.
		userEvent.tab();

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		expect( btn ).toBeEnabled();
		expect( screen.queryByRole( 'alert' ) ).toBeNull();
	} );

	test( 'renders the "Need more help?" link below the submit button', () => {
		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		const helpLink = screen.getByRole( 'link', { name: /Need more help/i } );

		// eslint-disable-next-line no-bitwise
		const isFollowing = btn.compareDocumentPosition( helpLink ) & Node.DOCUMENT_POSITION_FOLLOWING;
		expect( isFollowing ).toBeTruthy();
	} );

	test( 'handles error messages coming from /wp-login.php?action=lostpassword', async () => {
		const mockHTMLResponse = `
			<body id="error-page">
				<div class="wp-die-message">You have exceeded the password reset limit, you can try again in 30 minutes. If you try again before then, it will increase the time you have to wait until you can reset your password.</div>
			</body>
		`;

		// First call to fetch will return this result only once.
		mockFetch.mockResolvedValueOnce( {
			ok: false,
			status: 400,
			text: jest.fn().mockResolvedValue( mockHTMLResponse ),
		} );

		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);

		const btn = screen.getByRole( 'button', { name: /Reset my password/i } );
		await userEvent.click( btn );

		await waitFor( () => {
			expect( screen.getByRole( 'alert' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				/You have exceeded the password reset limit/i
			);
		} );
	} );

	test( 'includes blackbox_session_id in the lost password request when available', async () => {
		// Gate + lost-password surface both on (the enabled baseline).
		getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );

		mockFetch.mockResolvedValueOnce( {
			ok: true,
			status: 200,
			text: jest.fn().mockResolvedValue( '<html></html>' ),
		} );

		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Reset my password/i } ) );

		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalled();
		} );

		const [ url, options ] = mockFetch.mock.calls[ 0 ];
		expect( url ).toBe( 'https://example.com/wp-login.php?action=lostpassword' );
		expect( options.body.get( 'user_login' ) ).toBe( 'user@example.com' );
		expect( options.body.get( 'blackbox_session_id' ) ).toBe( 'ABCDEFGHIJKLMNOPQRSTuv' );
	} );

	test( 'omits blackbox_session_id when the lost-password feature flag is off', async () => {
		// Gate on, but the lost-password surface itself is disabled.
		config.disable( 'blackbox-lost-password' );
		getBlackboxSessionId.mockResolvedValue( 'ABCDEFGHIJKLMNOPQRSTuv' );

		mockFetch.mockResolvedValueOnce( {
			ok: true,
			status: 200,
			text: jest.fn().mockResolvedValue( '<html></html>' ),
		} );

		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Reset my password/i } ) );

		await waitFor( () => {
			expect( mockFetch ).toHaveBeenCalled();
		} );

		const [ , options ] = mockFetch.mock.calls[ 0 ];
		expect( options.body.get( 'blackbox_session_id' ) ).toBeNull();
		expect( getBlackboxSessionId ).not.toHaveBeenCalled();
	} );

	test( 'resets Blackbox when the lost password POST fails', async () => {
		window.Blackbox = { reset: jest.fn() };

		mockFetch.mockResolvedValueOnce( {
			ok: false,
			status: 400,
			text: jest.fn().mockResolvedValue( '' ),
		} );

		render( <LostPasswordForm redirectToAfterLoginUrl="" oauth2ClientId="" locale="" /> );

		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Email address or username' } ),
			'user@example.com'
		);

		await userEvent.click( screen.getByRole( 'button', { name: /Reset my password/i } ) );

		await waitFor( () => {
			expect( window.Blackbox.reset ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
