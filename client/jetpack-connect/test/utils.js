/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import {
	addCalypsoEnvQueryArg,
	cleanUrl,
	getRoleFromScope,
	parseAuthorizationQuery,
} from '../utils';

jest.mock( 'config', () => input => {
	const lookupTable = {
		env_id: 'mocked-test-env-id',
	};
	if ( input in lookupTable ) {
		return lookupTable[ input ];
	}
	throw new Error( 'Unrecognized input to mocked config' );
} );

describe( 'addCalypsoEnvQueryArg', () => {
	test( 'should add config env_id as calypso_env', () => {
		expect( addCalypsoEnvQueryArg( 'http://example.com' ) ).toBe(
			'http://example.com/?calypso_env=mocked-test-env-id'
		);
	} );
} );

describe( 'cleanUrl', () => {
	test( 'should prepare entered urls for network access', () => {
		const results = [
			{ input: '', expected: '' },
			{ input: 'a', expected: 'http://a' },
			{ input: 'example.com', expected: 'http://example.com' },
			{ input: '  example.com   ', expected: 'http://example.com' },
			{ input: 'http://example.com/', expected: 'http://example.com' },
			{ input: 'eXAmple.com', expected: 'http://example.com' },
			{ input: 'example.com/wp-admin', expected: 'http://example.com' },
		];

		results.forEach( ( { input, expected } ) => expect( cleanUrl( input ) ).toBe( expected ) );
	} );
} );

describe( 'getRoleFromScope', () => {
	test( 'should return role from scope', () => {
		const result = getRoleFromScope( 'role:e8ae7346d1a0f800b64e' );
		expect( result ).toBe( 'role' );
	} );

	test( 'should return null if no role is found', () => {
		const result = getRoleFromScope( ':e8ae7346d1a0f800b64e' );
		expect( result ).toBe( null );
	} );

	test( 'should return null if no hash is found', () => {
		const result = getRoleFromScope( 'role' );
		expect( result ).toBe( null );
	} );

	test( 'should return null if scope is malformed', () => {
		const result = getRoleFromScope( 'rolee8ae7346d1a0f800b64e' );
		expect( result ).toBe( null );
	} );
} );

describe( 'parseAuthorizationQuery', () => {
	test( 'should return transformed data on valid input', () => {
		const data = {
			_wp_nonce: 'foobar',
			blogname: 'Just Another WordPress.com Site',
			client_id: '12345',
			home_url: 'http://yourjetpack.blog',
			redirect_uri: 'http://yourjetpack.blog/wp-admin/admin.php',
			scope: 'administrator:34579bf2a3185a47d1b31aab30125d',
			secret: '640fdbd69f96a8ca9e61',
			site: 'http://yourjetpack.blog',
			site_url: 'http://yourjetpack.blog',
			state: '1',
		};
		const result = parseAuthorizationQuery( data );
		expect( result ).not.toBeNull();
		expect( result ).toMatchSnapshot();
	} );

	test( 'should return null data on valid input', () => {
		expect( parseAuthorizationQuery( {} ) ).toBeNull();
	} );
} );
