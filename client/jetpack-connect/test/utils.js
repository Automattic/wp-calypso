/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import page from 'page';
import { externalRedirect } from 'calypso/lib/route';

/**
 * Internal dependencies
 */
import {
	addCalypsoEnvQueryArg,
	cleanUrl,
	getRoleFromScope,
	parseAuthorizationQuery,
	redirect,
} from '../utils';

import { JPC_PATH_PLANS, JPC_PATH_REMOTE_INSTALL, REMOTE_PATH_AUTH } from '../constants';

jest.mock( 'config', () => ( input ) => {
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
			close_window_after_login: '0',
			home_url: 'https://yourjetpack.blog',
			redirect_uri: 'https://yourjetpack.blog/wp-admin/admin.php',
			scope: 'administrator:34579bf2a3185a47d1b31aab30125d',
			secret: '640fdbd69f96a8ca9e61',
			site: 'https://yourjetpack.blog',
			site_url: 'https://yourjetpack.blog',
			state: '1',
		};
		const result = parseAuthorizationQuery( data );
		expect( result ).not.toBeNull();
		expect( result ).toMatchSnapshot();
	} );

	test( 'isPopup, closeWindowAfterLogin should be true if string is 1', () => {
		const data = {
			_wp_nonce: 'foobar',
			blogname: 'Just Another WordPress.com Site',
			client_id: '12345',
			close_window_after_login: '1',
			home_url: 'https://yourjetpack.blog',
			is_popup: '1',
			redirect_uri: 'https://yourjetpack.blog/wp-admin/admin.php',
			scope: 'administrator:34579bf2a3185a47d1b31aab30125d',
			secret: '640fdbd69f96a8ca9e61',
			site: 'https://yourjetpack.blog',
			site_url: 'https://yourjetpack.blog',
			state: '1',
		};
		const result = parseAuthorizationQuery( data );
		expect( result.isPopup ).toBe( true );
		expect( result.closeWindowAfterLogin ).toBe( true );
	} );

	test( 'isPopup, closeWindowAfterLogin should be false if string is not 1', () => {
		const data = {
			_wp_nonce: 'foobar',
			blogname: 'Just Another WordPress.com Site',
			client_id: '12345',
			close_window_after_login: '0',
			home_url: 'https://yourjetpack.blog',
			is_popup: 'FALSE',
			redirect_uri: 'https://yourjetpack.blog/wp-admin/admin.php',
			scope: 'administrator:34579bf2a3185a47d1b31aab30125d',
			secret: '640fdbd69f96a8ca9e61',
			site: 'https://yourjetpack.blog',
			site_url: 'https://yourjetpack.blog',
			state: '1',
		};
		const result = parseAuthorizationQuery( data );
		expect( result.isPopup ).toBe( false );
		expect( result.closeWindowAfterLogin ).toBe( false );
	} );

	test( 'should return null data on valid input', () => {
		expect( parseAuthorizationQuery( {} ) ).toBeNull();
	} );
} );

jest.mock( 'lib/route/path', () => ( {
	externalRedirect: jest.fn(),
} ) );

jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

describe( 'redirect', () => {
	beforeEach( () => {
		externalRedirect.mockReset();
		page.redirect.mockReset();
	} );
	test( 'should fire redirect', () => {
		const results = [
			{ type: 'plans_selection', url: 'example.com', expected: JPC_PATH_PLANS + '/example.com' },
			{ type: 'remote_install', url: 'example.com', expected: JPC_PATH_REMOTE_INSTALL },
			{
				type: 'install_instructions',
				url: 'example.com',
				expected: '/jetpack/connect/instructions?url=example.com',
			},
			{
				type: 'remote_auth',
				url: 'example.com',
				expected: decodeURI( addCalypsoEnvQueryArg( 'example.com' + REMOTE_PATH_AUTH ) ),
			},
		];

		results.forEach( ( { type, url, expected } ) =>
			expect( redirect( type, url ) ).toBe( expected )
		);
	} );

	test( 'external redirect should be called once during remote authorization', () => {
		redirect( 'remote_auth', 'example.com' );
		expect( externalRedirect ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should redirect once', () => {
		redirect( 'plans_selection', 'example.com' );
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		page.redirect.mockReset();

		redirect( 'remote_install', 'example.com' );
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		page.redirect.mockReset();

		redirect( 'install_instructions', 'example.com' );
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
	} );
} );
