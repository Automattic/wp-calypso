/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { wpcomRequest as wpcomRequestOriginal } from '../../utils';
import { createControls } from '../controls';

jest.mock( '../../utils', () => ( {
	wpcomRequest: jest.fn(),
} ) );

const wpcomRequest: jest.Mock = wpcomRequestOriginal as any;

const { FETCH_AUTH_OPTIONS } = createControls( { client_id: '', client_secret: '' } );

describe( 'FETCH_AUTH_OPTIONS', () => {
	it( 'requests auth options for a username', async () => {
		const apiResponse = {
			success: true,
			data: { token_links: [] },
		};
		wpcomRequest.mockResolvedValue( apiResponse );

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
