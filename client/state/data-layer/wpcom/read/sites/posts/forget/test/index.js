/** @format */

/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { requestForgetPost, receiveForgetPost } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { forgetPost, updateRememberedPostStatus } from 'state/reader/remembered-posts/actions';
import { READER_REMEMBERED_POSTS_STATUS } from 'state/reader/remembered-posts/status';

describe( 'remember-posts', () => {
	describe( 'requestForgetPost', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = jest.fn();
			const action = forgetPost( { siteId: 123, postId: 456 } );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: READER_REMEMBERED_POSTS_STATUS.remembered,
				},
			} );
			const getState = () => {
				return {
					reader: {
						conversations: {
							items: {
								'123-456': READER_REMEMBERED_POSTS_STATUS.remembered,
							},
						},
					},
				};
			};
			requestForgetPost( { dispatch, getState }, action );
			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/remember',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					actionWithRevert
				)
			);
		} );
	} );

	describe( 'receiveForgetPost', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = jest.fn();
			receiveForgetPost(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: READER_REMEMBERED_POSTS_STATUS.remembered },
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

		test( 'should revert to the previous follow state if it fails', () => {
			const dispatch = jest.fn();
			receiveForgetPost(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: READER_REMEMBERED_POSTS_STATUS.remembered },
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
			expect( dispatch ).toHaveBeenCalledWith(
				bypassDataLayer(
					updateRememberedPostStatus( {
						siteId: 123,
						postId: 456,
						followStatus: READER_REMEMBERED_POSTS_STATUS.remembered,
					} )
				)
			);
		} );
	} );
} );
