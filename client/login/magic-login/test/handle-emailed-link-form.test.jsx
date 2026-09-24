/** @jest-environment jsdom */
import page from '@automattic/calypso-router';
import { HandleEmailedLinkForm } from '../handle-emailed-link-form';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

// The two-factor-challenge fields the auth thunk dispatches via LOGIN_REQUEST_SUCCESS.
const TWO_FACTOR_PROPS = {
	twoFactorEnabled: true,
	twoFactorNotificationSent: 'none',
};

function buildInstance( props = {} ) {
	const instance = new HandleEmailedLinkForm( {
		emailAddress: 'user@example.com',
		token: 'a-token',
		// Pre-auth state: the component mounts before the magic-link POST resolves, so
		// `twoFactorEnabled` is still false on the committed props.
		twoFactorEnabled: false,
		twoFactorNotificationSent: null,
		redirectToSanitized: null,
		oauth2Client: {},
		wccomFrom: undefined,
		rebootAfterLogin: jest.fn(),
		showMagicLoginLinkExpiredPage: jest.fn(),
		...props,
	} );
	// We invoke lifecycle methods directly on an unmounted instance, so stub setState.
	instance.setState = jest.fn();
	instance.state = { hasSubmitted: true, isRedirecting: false };
	return instance;
}

describe( 'HandleEmailedLinkForm 2FA handoff', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
