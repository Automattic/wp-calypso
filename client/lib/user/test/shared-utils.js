import config from '@automattic/calypso-config';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';

jest.mock( '@automattic/calypso-config', () => {
	const mock = jest.fn();
	mock.isEnabled = jest.fn();

	return mock;
} );

const configMock = ( values ) => ( key ) => values[ key ];

describe( 'UserUtils', () => {
	describe( 'without logout url', () => {
		beforeAll( () => {
			config.isEnabled.mockImplementation( configMock( { always_use_logout_url: false } ) );
		} );

		test( 'uses userData.logout_URL when available', () => {
			const user = { logout_URL: '/userdata' };
			expect( getLogoutUrl( user ) ).toBe( '/userdata' );
		} );
	} );

	describe( 'with logout url', () => {
		beforeAll( () => {
			config.isEnabled.mockImplementation( configMock( { always_use_logout_url: true } ) );
		} );

		test( 'works when |subdomain| is not present', () => {
			config.mockImplementation( configMock( { logout_url: 'wp.com/without-domain' } ) );
			const user = { logout_URL: '/userdata', localeSlug: 'es' };
			expect( getLogoutUrl( user ) ).toBe( 'wp.com/without-domain' );
		} );

		test( 'replaces |subdomain| when present and have non-default locale', () => {
			config.mockImplementation( configMock( { logout_url: '|subdomain|wp.com/with-domain' } ) );
			const user = { logout_URL: '/userdata', localeSlug: 'es' };
			expect( getLogoutUrl( user ) ).toBe( 'es.wp.com/with-domain' );
		} );

		test( 'replaces |subdomain| when present but no locale', () => {
			config.mockImplementation( configMock( { logout_url: '|subdomain|wp.com/with-domain' } ) );
			const user = { logout_URL: '/userdata' };
			expect( getLogoutUrl( user ) ).toBe( 'wp.com/with-domain' );
		} );
	} );

	describe( 'without user', () => {
		const logoutUrl = 'https://wordpress.com/wp-login.php?action=logout';
		beforeAll( () => {
			config.mockImplementation( configMock( { logout_url: logoutUrl } ) );
			config.isEnabled.mockImplementation( configMock( { always_use_logout_url: false } ) );
		} );

		test( 'falls back to the config logout URL', () => {
			expect( getLogoutUrl() ).toBe( logoutUrl );
		} );

		test( 'appends redirect URL to the config logout URL', () => {
			const postLogoutUrl = 'https://post-logout.wp.com';
			expect( getLogoutUrl( undefined, postLogoutUrl ) ).toBe(
				logoutUrl + '&redirect_to=' + encodeURIComponent( postLogoutUrl )
			);
		} );
	} );
} );
