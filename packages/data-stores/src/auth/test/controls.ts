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
import wpcomRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import { createControls } from '../controls';

jest.mock( 'wpcom-proxy-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	requestAllBlogsAccess: jest.fn( () => Promise.resolve() ),
} ) );

const { FETCH_AUTH_OPTIONS } = createControls( { client_id: '', client_secret: '' } );

describe( 'FETCH_AUTH_OPTIONS', () => {
	it( 'requests auth options for a username', async () => {
		const apiResponse = {
			success: true,
			data: { token_links: [] },
		};
		( wpcomRequest as jest.Mock ).mockResolvedValue( apiResponse );

		const result = await FETCH_AUTH_OPTIONS( {
			type: 'FETCH_AUTH_OPTIONS',
			usernameOrEmail: 'user1',
		} );

		expect( result ).toEqual( apiResponse );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/user1/auth-options',
			} )
		);
	} );

	it( 'escapes email addresses', async () => {
		await FETCH_AUTH_OPTIONS( {
			type: 'FETCH_AUTH_OPTIONS',
			usernameOrEmail: 'test@email.com',
		} );

		expect( wpcomRequest ).toHaveBeenLastCalledWith(
			expect.objectContaining( {
				path: '/users/test%40email.com/auth-options',
			} )
		);
	} );
} );
