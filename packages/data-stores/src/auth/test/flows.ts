/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { dispatch, select } from '@wordpress/data';
import { parse } from 'qs';

/**
 * Internal dependencies
 */
import { register } from '..';
import { wpcomRequest as wpcomRequestOriginal } from '../../utils';

jest.mock( '../../utils', () => ( {
	wpcomRequest: jest.fn(),
} ) );

const wpcomRequest: jest.Mock = wpcomRequestOriginal as any;
const fetch = jest.fn();

beforeAll( () => {
	( global as any ).fetch = fetch;
} );

let store: ReturnType< typeof register >;
beforeEach( () => {
	store = register( { client_id: '', client_secret: '' } );

	fetch.mockReset();
	wpcomRequest.mockReset();
} );

describe( 'password login flow', () => {
	it( 'logs in with correct credentials', async () => {
		const { getLoginFlowState } = select( store );
		const { submitUsernameOrEmail, submitPassword } = dispatch( store );

		expect( getLoginFlowState() ).toBe( 'ENTER_USERNAME_OR_EMAIL' );

		wpcomRequest.mockResolvedValue( { email_verified: true, passwordless: false } );

		await submitUsernameOrEmail( 'user1' );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/user1/auth-options',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );

		fetch.mockResolvedValue( {
			json: () =>
				Promise.resolve( {
					success: true,
					data: { token_links: [] },
				} ),
		} );

		await submitPassword( 'passw0rd' );

		expect( fetch ).toHaveBeenLastCalledWith(
			'https://wordpress.com/wp-login.php?action=login-endpoint',
			expect.objectContaining( {
				method: 'POST',
				body: expect.any( String ),
			} )
		);

		const requestBody = fetch.mock.calls[ 0 ][ 1 ].body;
		expect( parse( requestBody ) ).toEqual(
			expect.objectContaining( {
				username: 'user1',
				password: 'passw0rd',
				remember_me: 'true',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'LOGGED_IN' );
	} );
} );
