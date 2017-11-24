/** @format */

/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { requestConversationFollow, receiveConversationFollow } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	followConversation,
	updateConversationFollowStatus,
} from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS } from 'state/reader/conversations/follow-status';

describe( 'conversation-follow', () => {
	describe( 'requestConversationFollow', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = jest.fn();
			const action = followConversation( { siteId: 123, postId: 456 } );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: CONVERSATION_FOLLOW_STATUS.muting,
				},
			} );
			const getState = () => {
				return {
					reader: {
						conversations: {
							items: {
								'123-456': 'M',
							},
						},
					},
				};
			};
			requestConversationFollow( { dispatch, getState }, action );
			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/follow',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					actionWithRevert
				)
			);
		} );
	} );

	describe( 'receiveConversationFollow', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = jest.fn();
			receiveConversationFollow(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.muting },
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
			receiveConversationFollow(
				{ dispatch },
				{
					payload: { siteId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS.muting },
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
					updateConversationFollowStatus( {
						siteId: 123,
						postId: 456,
						followStatus: CONVERSATION_FOLLOW_STATUS.muting,
					} )
				)
			);
		} );
	} );
} );
