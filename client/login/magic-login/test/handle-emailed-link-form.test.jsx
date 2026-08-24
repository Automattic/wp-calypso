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
