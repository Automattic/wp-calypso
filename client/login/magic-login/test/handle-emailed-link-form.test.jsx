/** @vitest-environment jsdom */
import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { translate } from 'i18n-calypso';
import { vi } from 'vitest';
import { HandleEmailedLinkForm } from '../handle-emailed-link-form';

const mockIsWebAuthnSupported = vi.fn();

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );
vi.mock( '../emailed-login-link-expired', () => ( { default: () => null } ) );
vi.mock( 'calypso/lib/webauthn', async () => ( {
	...( await vi.importActual( 'calypso/lib/webauthn' ) ),
	isWebAuthnSupported: () => mockIsWebAuthnSupported(),
} ) );

// The two-factor-challenge fields the auth thunk dispatches via LOGIN_REQUEST_SUCCESS.
const TWO_FACTOR_PROPS = {
	twoFactorEnabled: true,
	twoFactorNotificationSent: 'none',
	twoFactorSupportedAuthTypes: [ 'authenticator', 'backup' ],
};

function buildInstance( props = {} ) {
	const instance = new HandleEmailedLinkForm( {
		emailAddress: 'user@example.com',
		token: 'a-token',
		// Pre-auth state: the component mounts before the magic-link POST resolves, so
		// `twoFactorEnabled` is still false on the committed props.
		twoFactorEnabled: false,
		twoFactorNotificationSent: null,
		twoFactorSupportedAuthTypes: null,
		redirectToSanitized: null,
		oauth2Client: {},
		wccomFrom: undefined,
		rebootAfterLogin: vi.fn(),
		showMagicLoginLinkExpiredPage: vi.fn(),
		...props,
	} );
	// We invoke lifecycle methods directly on an unmounted instance, so stub setState.
	instance.setState = vi.fn();
	instance.state = { hasSubmitted: true, isRedirecting: false };
	return instance;
}

describe( 'HandleEmailedLinkForm 2FA handoff', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockIsWebAuthnSupported.mockReturnValue( false );
	} );

	it( 'routes a passkey account to the security key prompt when the browser supports WebAuthn', () => {
		mockIsWebAuthnSupported.mockReturnValue( true );
		const instance = buildInstance();

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				...TWO_FACTOR_PROPS,
				twoFactorSupportedAuthTypes: [ 'webauthn', 'authenticator', 'backup' ],
				isAuthenticated: true,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( page ).toHaveBeenCalledWith( '/log-in/webauthn' );
	} );

	it( 'routes a passkey account without an authenticator app to the backup code prompt when the browser lacks WebAuthn', () => {
		// The server issues no authenticator nonce for this account, so the authenticator
		// prompt would reject every code.
		const instance = buildInstance();

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				...TWO_FACTOR_PROPS,
				twoFactorSupportedAuthTypes: [ 'webauthn', 'backup' ],
				isAuthenticated: true,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( page ).toHaveBeenCalledWith( '/log-in/backup' );
	} );

	it( 'routes an authenticator-2FA account to the authenticator prompt using nextProps', () => {
		// Regression: `UNSAFE_componentWillUpdate` runs during the render phase, before
		// `this.props` is committed. The 2FA challenge only exists on `nextProps`, so reading
		// `this.props` would see the stale `twoFactorEnabled: false` and reboot to the
		// logged-out home instead of showing the 2FA form.
		const instance = buildInstance();

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				...TWO_FACTOR_PROPS,
				isAuthenticated: true,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( instance.props.rebootAfterLogin ).not.toHaveBeenCalled();
		expect( page ).toHaveBeenCalledTimes( 1 );
		expect( page ).toHaveBeenCalledWith( expect.stringContaining( '/log-in/authenticator' ) );
		expect( instance.setState ).toHaveBeenCalledWith( { isRedirecting: true } );
	} );

	it( 'keeps the 2FA prompt when the redirect is a Jetpack SSO login', () => {
		// Regression: `login()` used to hand back a `redirect_to` containing `jetpack-sso`
		// verbatim, so this navigated to the SSO handler before the second factor was
		// collected. With no session yet, the handler bounced the user back to the login page.
		const redirectToSanitized =
			'https://wordpress.com/wp-login.php?action=jetpack-sso&site_id=123&sso_nonce=abc';
		const instance = buildInstance( { redirectToSanitized } );

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				...TWO_FACTOR_PROPS,
				isAuthenticated: true,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( page ).toHaveBeenCalledWith(
			'/log-in/authenticator?redirect_to=https%3A%2F%2Fwordpress.com%2Fwp-login.php%3Faction%3Djetpack-sso%26site_id%3D123%26sso_nonce%3Dabc'
		);
		expect( instance.setState ).toHaveBeenCalledWith( { isRedirecting: true } );
	} );

	it( 'reboots after login when the account has no second factor', () => {
		const instance = buildInstance();

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				twoFactorEnabled: false,
				twoFactorNotificationSent: null,
				isAuthenticated: true,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( page ).not.toHaveBeenCalled();
		expect( instance.props.rebootAfterLogin ).toHaveBeenCalledWith( { magic_login: 1 } );
	} );

	it( 'shows the expired page when authentication did not succeed', () => {
		const instance = buildInstance();

		instance.UNSAFE_componentWillUpdate(
			{
				...instance.props,
				isAuthenticated: false,
				isFetching: false,
				authError: null,
			},
			{ hasSubmitted: true, isRedirecting: false }
		);

		expect( instance.props.showMagicLoginLinkExpiredPage ).toHaveBeenCalled();
		expect( page ).not.toHaveBeenCalled();
		expect( instance.props.rebootAfterLogin ).not.toHaveBeenCalled();
	} );
} );

describe( 'HandleEmailedLinkForm view tracking', () => {
	const baseProps = {
		emailAddress: 'user@example.com',
		token: 'a-token',
		oauth2Client: {},
		initialQuery: {},
		translate: ( text ) => text,
		fetchMagicLoginAuthenticate: vi.fn(),
		showMagicLoginLinkExpiredPage: vi.fn(),
		rebootAfterLogin: vi.fn(),
	};

	it( 'records the view event once across re-renders', () => {
		const recordTracksEvent = vi.fn();
		const { rerender } = render(
			<HandleEmailedLinkForm { ...baseProps } recordTracksEvent={ recordTracksEvent } />
		);

		rerender(
			<HandleEmailedLinkForm { ...baseProps } recordTracksEvent={ recordTracksEvent } isFetching />
		);

		expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_login_email_link_handle_click_view'
		);
	} );

	it( 'does not record the view event when the link is already expired on mount', () => {
		const recordTracksEvent = vi.fn();

		render(
			<HandleEmailedLinkForm { ...baseProps } recordTracksEvent={ recordTracksEvent } isExpired />
		);

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not record the view event when the link has no token', () => {
		const recordTracksEvent = vi.fn();

		render(
			<HandleEmailedLinkForm { ...baseProps } recordTracksEvent={ recordTracksEvent } token="" />
		);

		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );

describe( 'HandleEmailedLinkForm confirm-subscription account mismatch', () => {
	const redirectTo =
		'https://subscribe.wordpress.com/?key=test&email=bob%40example.com&activate=abc123';

	const mismatchProps = {
		clientId: '39911',
		emailAddress: 'bob@example.com',
		token: 'a-token',
		redirectTo,
		redirectToOriginal: '',
		transition: true,
		activate: 'abc123',
		currentUser: { email: 'alice@example.com', username: 'alice' },
		oauth2Client: {},
		initialQuery: {},
		translate,
		fetchMagicLoginAuthenticate: vi.fn(),
		showMagicLoginLinkExpiredPage: vi.fn(),
		rebootAfterLogin: vi.fn(),
		recordTracksEvent: vi.fn(),
	};

	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'renders the mismatch warning without auto-submitting and authenticates on confirmation', async () => {
		const user = userEvent.setup();

		render( <HandleEmailedLinkForm { ...mismatchProps } /> );

		expect( mismatchProps.fetchMagicLoginAuthenticate ).not.toHaveBeenCalled();
		expect(
			screen.getByRole( 'heading', { name: 'You’re signed in to a different account' } )
		).toBeVisible();
		expect( screen.getByText( /This link confirms the subscription for/ ) ).toHaveTextContent(
			'bob@example.com'
		);
		expect( screen.getByText( /This link confirms the subscription for/ ) ).toHaveTextContent(
			'alice@example.com'
		);
		expect( screen.getByRole( 'link', { name: 'Cancel' } ) ).toHaveAttribute( 'href', '/home' );

		const switchButton = screen.getByRole( 'button', { name: 'Switch accounts and confirm' } );
		await user.click( switchButton );

		expect( mismatchProps.fetchMagicLoginAuthenticate ).toHaveBeenCalledWith(
			'a-token',
			redirectTo,
			null
		);
	} );

	it( 'auto-submits when the signed-in email matches the subscription link email', () => {
		render(
			<HandleEmailedLinkForm
				{ ...mismatchProps }
				currentUser={ { email: 'Bob@Example.com', username: 'bob' } }
			/>
		);

		expect( mismatchProps.fetchMagicLoginAuthenticate ).toHaveBeenCalledWith(
			'a-token',
			redirectTo,
			null
		);
		expect(
			screen.queryByRole( 'heading', { name: 'You’re signed in to a different account' } )
		).not.toBeInTheDocument();
	} );
} );
