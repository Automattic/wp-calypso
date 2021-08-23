import { closeAccount } from 'calypso/state/account/actions';
import { ACCOUNT_CLOSE_SUCCESS } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	requestAccountClose,
	receiveAccountCloseSuccess,
	receiveAccountCloseError,
	fromApi,
} from '../';

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
		test( 'should return success action', () => {
			expect( receiveAccountCloseSuccess() ).toEqual( {
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
