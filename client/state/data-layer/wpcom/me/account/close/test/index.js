/** @format */

/**
 * Internal dependencies
 */
import { requestAccountClose, receiveAccountCloseError, fromApi } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { closeAccount } from 'state/account/actions';

describe( 'account-close', () => {
	describe( 'requestAccountClose', () => {
		test( 'should dispatch a HTTP request', () => {
			const action = closeAccount();
			expect( requestAccountClose( action ) ).toEqual(
				http(
					{
						method: 'POST',
						path: '/me/account/close',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful closure', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for an successful closure', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );

	describe( 'receiveAccountCloseError', () => {
		test( 'should fire an error notice', () => {
			const result = receiveAccountCloseError( closeAccount(), {
				success: false,
			} );

			expect( result ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
		} );
	} );
} );
