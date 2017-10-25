/** @format */

/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { requestConversationMute, receiveConversationMute } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	muteConversation,
	updateConversationFollowStatus,
} from 'state/reader/conversations/actions';
import { CONVERSATION_FOLLOW_STATUS_FOLLOWING } from 'state/reader/conversations/follow-status';

describe( 'conversation-mute', () => {
	describe( 'requestConversationMute', () => {
		test( 'should dispatch an http request', () => {
			const dispatch = jest.fn();
			const action = muteConversation( { blogId: 123, postId: 456 } );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: CONVERSATION_FOLLOW_STATUS_FOLLOWING,
				},
			} );
			requestConversationMute( { dispatch }, action );
			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'POST',
						path: '/read/sites/123/posts/456/mute',
						body: {},
						apiNamespace: 'wpcom/v2',
					},
					actionWithRevert
				)
			);
		} );
	} );

	describe( 'receiveConversationMute', () => {
		test( 'should dispatch a success notice', () => {
			const dispatch = jest.fn();
			receiveConversationMute(
				{ dispatch },
				{
					payload: { blogId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS_FOLLOWING },
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
			receiveConversationMute(
				{ dispatch },
				{
					payload: { blogId: 123, postId: 456 },
					meta: { previousState: CONVERSATION_FOLLOW_STATUS_FOLLOWING },
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
						blogId: 123,
						postId: 456,
						followStatus: CONVERSATION_FOLLOW_STATUS_FOLLOWING,
					} )
				)
			);
		} );
	} );
} );
