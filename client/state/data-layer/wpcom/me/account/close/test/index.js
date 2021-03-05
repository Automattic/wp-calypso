/**
 * Internal dependencies
 */
import {
	requestAccountClose,
	receiveAccountCloseSuccess,
	receiveAccountCloseError,
	fromApi,
} from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { closeAccount } from 'calypso/state/account/actions';
import { ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';

jest.mock( 'calypso/lib/user', () => () => {
	return { clear: jest.fn() };
} );

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

	describe( 'receiveAccountCloseSuccess', () => {
		test( 'should dispatch a success action', async () => {
			const spy = jest.fn();
			await receiveAccountCloseSuccess()( spy );

			expect( spy ).toHaveBeenCalledWith( {
				type: ACCOUNT_CLOSE_SUCCESS,
			} );
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
