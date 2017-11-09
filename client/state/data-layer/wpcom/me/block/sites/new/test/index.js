/** @format */

/**
 * Internal dependencies
 */
import { requestSiteBlock, receiveSiteBlock } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { blockSite, unblockSite } from 'state/reader/site-blocks/actions';

describe( 'site-blocks', () => {
	describe( 'requestSiteBlock', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = jest.fn();
			const action = blockSite( 123 );
			requestSiteBlock( { dispatch }, action );
			expect( dispatch ).toHaveBeenCalledWith(
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
			const dispatch = jest.fn();
			receiveSiteBlock(
				{ dispatch },
				{
					payload: { siteId: 123 },
				},
				{ success: true }
			);
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-success',
					} ),
				} )
			);
		} );

		test( 'should revert to the previous state if it fails', () => {
			const dispatch = jest.fn();
			receiveSiteBlock(
				{ dispatch },
				{
					payload: { siteId: 123 },
				},
				{
					success: false,
				}
			);
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
