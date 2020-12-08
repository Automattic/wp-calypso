/**
 * External dependencies
 */
import { first, last } from 'lodash';

/**
 * Internal dependencies
 */
import { createPathWithoutImmediateLoginInformation, createImmediateLoginMessage } from '../utils';
import { REASONS_FOR_MANUAL_RENEWAL } from '../constants';

describe( 'immediate-login/utils', () => {
	describe( 'createPathWithoutImmediateLoginInformation', () => {
		// eslint-disable-next-line jest/expect-expect
		test( 'should be possible to call', () => {
			createPathWithoutImmediateLoginInformation( '', {} );
		} );
		test( 'should return the same path if no parameters are present [1]', () => {
			expect( createPathWithoutImmediateLoginInformation( '/', {} ) ).toBe( '/' );
		} );
		test( 'should return the same path if no parameters are present [2]', () => {
			expect( createPathWithoutImmediateLoginInformation( '/root/', {} ) ).toBe( '/root/' );
		} );
		test( 'should return the same path if no parameters are present [3]', () => {
			expect( createPathWithoutImmediateLoginInformation( '/test/another_segment/', {} ) ).toBe(
				'/test/another_segment/'
			);
		} );

		test( 'should return the same path if no login-related parameters are present [1]', () => {
			expect( createPathWithoutImmediateLoginInformation( '/', { url: 'test' } ) ).toBe(
				'/?url=test'
			);
		} );
		test( 'should return the same path if no login-related parameters are present [2]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/root/', { page: 15, offset: 32 } )
			).toBe( '/root/?page=15&offset=32' );
		} );
		test( 'should properly encode query parameters keys and values', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					'the title': 'Tom & Jerry',
					another: 'param',
				} )
			).toBe( '/test/another_segment/?the%20title=Tom%20%26%20Jerry&another=param' );
		} );

		test( 'should remove immediate-login-related query params [1]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					immediate_login_attempt: 'true',
				} )
			).toBe( '/test/another_segment/' );
		} );

		test( 'should remove immediate-login-related query params [2]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					login_reason: 'some reason',
				} )
			).toBe( '/test/another_segment/' );
		} );

		test( 'should remove immediate-login-related query params [3]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					immediate_login_attempt: 'true',
					login_reason: 'some reason',
				} )
			).toBe( '/test/another_segment/' );
		} );

		test( 'should remove immediate-login-related query params [4]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					immediate_login_attempt: 'true',
					immediate_login_success: 'true',
					login_reason: 'some reason',
					login_email: 'test@example.com',
					login_locale: 'fr',
				} )
			).toBe( '/test/another_segment/' );
		} );

		test( 'should remove immediate-login-related query params [5]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					immediate_login_attempt: 'true',
					login_reason: 'some reason',
					unrelated: 'value1',
					unrelated2: 'value2',
				} )
			).toBe( '/test/another_segment/?unrelated=value1&unrelated2=value2' );
		} );

		test( 'should remove immediate-login-related query params [6]', () => {
			expect(
				createPathWithoutImmediateLoginInformation( '/test/another_segment/', {
					immediate_login_attempt: 'true',
					immediate_login_success: 'true',
					unrelated: 'value1',
					unrelated2: 'value2',
					login_reason: 'some reason',
					login_email: 'test@example.com',
					login_locale: 'fr',
				} )
			).toBe( '/test/another_segment/?unrelated=value1&unrelated2=value2' );
		} );
	} );

	describe( 'createImmediateLoginMessage', () => {
		// eslint-disable-next-line jest/expect-expect
		test( 'should be possible to call', () => {
			createImmediateLoginMessage( '', '' );
		} );
		test( 'should return a string', () => {
			expect( typeof createImmediateLoginMessage( '', '' ) ).toBe( 'string' );
		} );

		const messages = [
			createImmediateLoginMessage( '', 'test@wordpress.com' ),
			createImmediateLoginMessage( first( REASONS_FOR_MANUAL_RENEWAL ), 'test@wordpress.com' ),
			createImmediateLoginMessage( last( REASONS_FOR_MANUAL_RENEWAL ), 'test@wordpress.com' ),
		];
		test( 'should put an email in every message', () => {
			for ( const m of messages ) {
				expect( m.indexOf( 'test@wordpress.com' ) ).not.toBe( -1 );
			}
		} );
	} );
} );
