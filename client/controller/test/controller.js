/**
 * @jest-environment jsdom
 */

import configureStore from 'redux-mock-store';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { maybeRedirectToMultiSiteDashboard, redirectLoggedOut } from '../index.web';

jest.mock( '@automattic/calypso-router' );
jest.mock( 'wpcom-proxy-request', () => ( {
	isCookieAuthMissing: jest.fn( () => false ),
} ) );
jest.mock( 'calypso/dashboard/utils/link', () => ( {
	dashboardLink: jest.fn( ( path ) => `https://my.wordpress.com${ path }` ),
} ) );
jest.mock( 'calypso/lib/analytics/mc', () => ( { bumpStat: jest.fn() } ) );

const mockStore = configureStore();

describe( 'maybeRedirectToMultiSiteDashboard', () => {
	// `config/test.json` enables `dashboard/enable-percentage-rollout`, which now
	// enrols every user, so `forced-opt-out` is the only way to be unenrolled.
	const targetPath = ( params ) => `/emails/choose-email-solution/${ params.domain }`;

	const buildContext = ( optIn ) => ( {
		store: mockStore( {
			currentUser: { id: 99 },
			preferences: {
				remoteValues: optIn ? { 'hosting-dashboard-opt-in': { value: optIn } } : {},
			},
		} ),
		params: { domain: 'example.com', site: 'example.wordpress.com' },
		query: {},
		path: '/email/example.com/purchase/example.wordpress.com',
	} );

	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	let next;
	let locationReplace;

	beforeEach( () => {
		next = jest.fn();
		locationReplace = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { replace: locationReplace },
		} );
		dashboardLink.mockClear();
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'does not redirect when the flag is disabled and the user is not enrolled', () => {
		maybeRedirectToMultiSiteDashboard( targetPath, () => false )(
			buildContext( 'forced-opt-out' ),
			next
		);

		expect( locationReplace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	it( 'redirects to the flag target when the predicate returns true', () => {
		maybeRedirectToMultiSiteDashboard( targetPath, () => true )( buildContext(), next );

		expect( locationReplace ).toHaveBeenCalledWith(
			'https://my.wordpress.com/emails/choose-email-solution/example.com'
		);
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'redirects force-enrolled users even when the flag is disabled', () => {
		maybeRedirectToMultiSiteDashboard( targetPath, () => false )(
			buildContext( 'forced-opt-in' ),
			next
		);

		expect( locationReplace ).toHaveBeenCalledWith(
			'https://my.wordpress.com/emails/choose-email-solution/example.com'
		);
		expect( next ).not.toHaveBeenCalled();
	} );
} );

describe( 'redirectLoggedOut', () => {
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	let next;

	beforeEach( () => {
		next = jest.fn();
		Object.defineProperty( window, 'location', {
			value: '',
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'redirects Woo-origin QR login requests back to the Woo mobile login fallback', async () => {
		const context = {
			store: mockStore( {
				currentUser: {
					id: null,
				},
			} ),
			query: {
				origin: 'woocommerce',
				return_to: 'https://woocommerce.test/mobilelogin/',
			},
			params: {},
			path: '/me/security/qr-login?origin=woocommerce',
			pathname: '/me/security/qr-login',
		};

		await redirectLoggedOut( context, next );

		expect( window.location ).toBe( 'https://woocommerce.test/mobilelogin/?wpcom_auth=missing' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'ignores unsafe Woo-origin QR login return_to values', async () => {
		const context = {
			store: mockStore( {
				currentUser: {
					id: null,
				},
			} ),
			query: {
				origin: 'woocommerce',
				return_to: 'https://evil.example/mobilelogin/',
			},
			params: {},
			path: '/me/security/qr-login?origin=woocommerce',
			pathname: '/me/security/qr-login',
		};

		await redirectLoggedOut( context, next );

		expect( window.location ).toBe( 'https://woocommerce.com/mobilelogin/?wpcom_auth=missing' );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'removes return_to from Woo-origin QR login URLs for logged-in users', async () => {
		const replaceState = jest
			.spyOn( window.history, 'replaceState' )
			.mockImplementation( () => {} );
		const context = {
			store: mockStore( {
				currentUser: {
					id: 123,
				},
			} ),
			query: {
				origin: 'woocommerce',
				return_to: 'https://woocommerce.test/mobilelogin/',
			},
			params: {},
			path: '/me/security/qr-login?origin=woocommerce&return_to=https%3A%2F%2Fwoocommerce.test%2Fmobilelogin%2F',
			pathname: '/me/security/qr-login',
		};

		await redirectLoggedOut( context, next );

		expect( replaceState ).toHaveBeenCalledWith(
			window.history.state,
			'',
			'/me/security/qr-login?origin=woocommerce'
		);
		expect( context.query ).toEqual( { origin: 'woocommerce' } );
		expect( context.path ).toBe( '/me/security/qr-login?origin=woocommerce' );
		expect( next ).toHaveBeenCalled();

		replaceState.mockRestore();
	} );

	describe( 'immediate login prefill', () => {
		const buildImmediateLoginContext = ( { query = {}, immediateLogin = {} } = {} ) => ( {
			store: mockStore( {
				currentUser: { id: null },
				immediateLogin,
			} ),
			query,
			params: {},
			path: '/me/purchases',
			pathname: '/me/purchases',
		} );

		it( 'prefills the email and locale from the query before ROUTE_SET has run', async () => {
			// `setupRoutes()` registers this middleware ahead of the `ROUTE_SET`
			// catch-all, so an immediate login link reaches it with an empty store.
			const context = buildImmediateLoginContext( {
				query: {
					immediate_login_attempt: '1',
					login_email: 'jane@example.com',
					login_locale: 'fr',
				},
			} );

			await redirectLoggedOut( context, next );

			expect( window.location ).toBe(
				'/log-in/fr?redirect_to=%2Fme%2Fpurchases&email_address=jane%40example.com'
			);
			expect( next ).not.toHaveBeenCalled();
		} );

		it( 'falls back to the stored values once the query has been stripped', async () => {
			const context = buildImmediateLoginContext( {
				immediateLogin: { email: 'jane@example.com', locale: 'fr' },
			} );

			await redirectLoggedOut( context, next );

			expect( window.location ).toBe(
				'/log-in/fr?redirect_to=%2Fme%2Fpurchases&email_address=jane%40example.com'
			);
		} );

		it( 'omits both parameters when neither the query nor the store has them', async () => {
			await redirectLoggedOut( buildImmediateLoginContext(), next );

			expect( window.location ).toBe( '/log-in?redirect_to=%2Fme%2Fpurchases' );
		} );
	} );
} );
