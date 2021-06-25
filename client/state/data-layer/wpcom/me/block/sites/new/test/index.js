/**
 * Internal dependencies
 */
import { requestSiteBlock, receiveSiteBlock, fromApi, receiveSiteBlockError } from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { blockSite, unblockSite } from 'calypso/state/reader/site-blocks/actions';

describe( 'site-blocks', () => {
	describe( 'requestSiteBlock', () => {
		test( 'should dispatch an http request', () => {
			const action = blockSite( 123 );
			expect( requestSiteBlock( action ) ).toEqual(
				http(
					{
						method: 'POST',
						path: '/me/block/sites/123/new',
						body: {},
						apiVersion: '1.1',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveSiteBlock', () => {
		test( 'should dispatch a success notice', () => {
			expect( receiveSiteBlock() ).toEqual(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-success',
					} ),
				} )
			);
		} );
	} );

	describe( 'fromApi', () => {
		it( 'should throw an error for an unsuccessful block', () => {
			expect( () => fromApi( { success: false } ) ).toThrow();
		} );
		it( 'should return original response for a successful block', () => {
			expect( fromApi( { success: true } ) ).toEqual( { success: true } );
		} );
	} );

	describe( 'receiveSiteBlockError', () => {
		test( 'should revert to the previous state', () => {
			const dispatch = jest.fn();
			receiveSiteBlockError( blockSite( 123 ), {
				success: false,
			} )( dispatch );

			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
					} ),
				} )
			);
			expect( dispatch ).toHaveBeenCalledWith( bypassDataLayer( unblockSite( 123 ) ) );
		} );
	} );
} );
