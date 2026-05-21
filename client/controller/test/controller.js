/**
 * @jest-environment jsdom
 */

import * as page from '@automattic/calypso-router';
import configureStore from 'redux-mock-store';
import addQueryArgs from 'calypso/lib/url/add-query-args';
import { redirectLoggedOut, redirectMyJetpack } from '../index.web';

jest.mock( '@automattic/calypso-router' );
jest.mock( 'wpcom-proxy-request', () => ( {
	isCookieAuthMissing: jest.fn( () => false ),
} ) );

const mockStore = configureStore();

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
} );

describe( 'redirectMyJetpack', () => {
	let pageSpy;
	let next;

	const query = {
		site: 'example.com',
		redirect_to: encodeURIComponent( 'http://example.com/wp-admin/admin.php?page=my-jetpack' ),
		source: 'my-jetpack',
	};

	const context = {
		store: mockStore( {
			currentUser: {
				id: null,
			},
			ui: {
				selectedSiteId: null,
			},
		} ),
		query,
		params: {
			// These properties are parsed from the path
			domainOrProduct: 'jetpack_backup_t1_yearly',
			product: '196967475',
		},
		path: addQueryArgs( query, `/checkout/123123/jetpack_backup_t1_yearly` ),
		pathname: '/checkout/123123/jetpack_backup_t1_yearly',
	};

	beforeEach( () => {
		pageSpy = jest.spyOn( page, 'default' );
		next = jest.fn();
	} );

	afterEach( () => {
		pageSpy.mockRestore();
		next.mockRestore();
	} );

	it( 'should redirect checkout with site id to siteless checkout if user is not logged in', () => {
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: context.query.site,
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( context, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );

	it( 'should redirect checkout with site slug to siteless checkout if user is not logged in', () => {
		const contextWithSiteSlug = {
			...context,
			path: addQueryArgs( query, `/checkout/example.com/jetpack_backup_t1_yearly` ),
			pathname: '/checkout/example.com/jetpack_backup_t1_yearly',
		};
		const redirectUrl = addQueryArgs(
			{
				connect_after_checkout: true,
				from_site_slug: context.query.site,
				admin_url: context.query.redirect_to.split( '?' )[ 0 ],
			},
			context.path.replace( /checkout\/[^?/]+\//, 'checkout/jetpack/' )
		);

		redirectMyJetpack( contextWithSiteSlug, next );

		expect( pageSpy ).toHaveBeenCalledWith( redirectUrl );
		expect( next ).not.toHaveBeenCalled();
	} );
} );
