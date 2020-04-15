/**
 * Internal dependencies
 */
import UserUtils from '../utils';
import config from 'config';
import User from 'lib/user';

const user = User();

jest.mock( 'config', () => {
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
			jest.spyOn( user, 'get' ).mockReturnValue( { logout_URL: '/userdata' } );
			expect( UserUtils.getLogoutUrl() ).toBe( '/userdata' );
		} );
	} );

	describe( 'with logout url', () => {
		beforeAll( () => {
			config.isEnabled.mockImplementation( configMock( { always_use_logout_url: true } ) );
		} );

		test( 'works when |subdomain| is not present', () => {
			config.mockImplementation( configMock( { logout_url: 'wp.com/without-domain' } ) );
			jest.spyOn( user, 'get' ).mockReturnValue( { logout_URL: '/userdata', localeSlug: 'es' } );
			expect( UserUtils.getLogoutUrl() ).toBe( 'wp.com/without-domain' );
		} );

		test( 'replaces |subdomain| when present and have non-default locale', () => {
			config.mockImplementation( configMock( { logout_url: '|subdomain|wp.com/with-domain' } ) );
			jest.spyOn( user, 'get' ).mockReturnValue( { logout_URL: '/userdata', localeSlug: 'es' } );
			expect( UserUtils.getLogoutUrl() ).toBe( 'es.wp.com/with-domain' );
		} );

		test( 'replaces |subdomain| when present but no locale', () => {
			config.mockImplementation( configMock( { logout_url: '|subdomain|wp.com/with-domain' } ) );
			jest.spyOn( user, 'get' ).mockReturnValue( { logout_URL: '/userdata' } );
			expect( UserUtils.getLogoutUrl() ).toBe( 'wp.com/with-domain' );
		} );
	} );
} );
