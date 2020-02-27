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

/**
 * Internal dependencies
 */
import { register } from '..';
import { wpcomRequest as wpcomRequestOriginal } from '../../utils';

jest.mock( '../../utils', () => ( {
	wpcomRequest: jest.fn(),
} ) );

const wpcomRequest: jest.Mock = wpcomRequestOriginal as any;

let store: ReturnType< typeof register >;
beforeEach( () => {
	store = register( { client_id: '', client_secret: '' } );
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
				path: '/users/user1/auth_options',
			} )
		);

		expect( getLoginFlowState() ).toBe( 'ENTER_PASSWORD' );

		wpcomRequest.mockResolvedValue( {
			success: true,
			data: { token_links: [] },
		} );

		await submitPassword( 'passw0rd' );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/wp-login.php?action=login-endpoint',
				body: expect.objectContaining( {
					username: 'user1',
					password: 'passw0rd',
					rememberme: true,
				} ),
			} )
		);

		expect( getLoginFlowState() ).toBe( 'LOGGED_IN' );
	} );
} );
