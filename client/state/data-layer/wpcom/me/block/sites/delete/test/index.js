/**
 * Internal dependencies
 */
import { requestSiteUnblock, receiveSiteUnblock, receiveSiteUnblockError, fromApi } from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { blockSite, unblockSite } from 'calypso/state/reader/site-blocks/actions';

describe( 'site-blocks', () => {
	describe( 'requestSiteUnblock', () => {
		test( 'should dispatch a HTTP request', () => {
			const action = unblockSite( 123 );
			expect( requestSiteUnblock( action ) ).toEqual(
				http(
					{
						method: 'POST',
						path: '/me/block/sites/123/delete',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveSiteUnblock', () => {
		test( 'should return a success notice', () => {
			const dispatchedAction = receiveSiteUnblock( unblockSite( 123 ), { success: true } );
			expect( dispatchedAction ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-plain',
					} ),
				} )
			);
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful unblock', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for an succesful unblock', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );

	describe( 'receiveSiteBlockError', () => {
		test( 'should revert to the previous state if it fails', () => {
			const dispatch = jest.fn();
			receiveSiteUnblockError( unblockSite( 123 ), {
				success: false,
			} )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith( bypassDataLayer( blockSite( 123 ) ) );
		} );
	} );
} );
