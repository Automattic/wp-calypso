/** @jest-environment jsdom */
import { mapState } from '../request-login-code';

describe( 'RequestLoginCode mapState', () => {
	const baseState = {
		currentUser: { id: null },
		users: { items: {} },
		login: {
			isFormDisabled: false,
			lastCheckedUsernameOrEmail: '',
			magicLogin: {
				requestEmailError: null,
				isFetchingEmail: false,
				currentView: null,
				requestedEmailSuccessfully: false,
				requestAuthError: null,
				rememberMe: false,
			},
			redirectTo: { original: '' },
		},
		route: { query: { current: {}, initial: {} } },
	};

	it( 'forwards redirectTo from state so the magic-code POST to /auth/send-login-email carries `redirect_to`', () => {
		// Regression: previously RequestLoginCode's mapState did not read redirectTo,
		// so the POST omitted `redirect_to` and the wpcom unified-connection magic-link
		// block could not parse `from=jetpack-connector` out of it.
		const state = {
			...baseState,
			login: {
				...baseState.login,
				redirectTo: {
					original:
						'https://wordpress.com/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack',
				},
			},
		};

		expect( mapState( state ).redirectTo ).toBe(
			'https://wordpress.com/jetpack/connect/authorize?from=jetpack-connector&plugins=jetpack'
		);
	} );
} );
